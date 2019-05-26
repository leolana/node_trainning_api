import { Sequelize } from 'sequelize-database';
import { PersonAPI } from '../../../infra/movidesk';
import { Person, getTipoPessoa, TipoPerfil } from '../../../infra/movidesk/PersonTypes';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import ParticipanteIntegracaoTipo from '../../entities/ParticipanteIntegracaoTipo';
import ParticipanteIntegracaoStatus from '../../entities/ParticipanteIntegracaoStatus';
import { LoggerInterface } from '../../../infra/logging';
import { NotificationUseCases } from '../notificacoes';
import { DateTime } from 'luxon';
import notificacaoCategoriaEnum from '../../../domain/services/notificacoes/notificacaoCategoriaEnum';
import rolesEnum from '../../../domain/services/auth/rolesEnum';
import usuarioNotificacaoEnum from '../../../domain/services/notificacoes/usuarioNotificacaoEnum';
import { getTipoDocumento, getSiglaParticipante } from '../../../domain/services/participante/personTypeEnum';
import { config } from '../../..//config';

const integrateWithMovideskUseCase = (
  db: Sequelize,
  personApi: PersonAPI,
  logger: LoggerInterface,
  notificationUseCases: NotificationUseCases
) => async (participanteId: number, user: string, throwErrors = true) => {
  try {
    if (!config.movidesk.enabled) {
      return false;
    }
    if (isNaN(participanteId)) {
      throw new Exceptions.ParticipanteNotFoundException();
    }

    const participante = await db.entities.participante.findOne({
      where: { id: participanteId },
      include: [{
        model: db.entities.cidade,
        as: 'cidade'
      }, {
        model: db.entities.participanteContato,
        as: 'contatos'
      }]
    });

    if (!participante) {
      throw new Exceptions.ParticipanteNotFoundException();
    }

    const ehFornecedor = await db.entities.participanteFornecedor
      .findOne({ where: { participanteId } });

    const movideskPersonData: Person = {
      codeReferenceAdditional: '',
      isActive: participante.ativo,
      personType: getTipoPessoa(participante.documento),
      profileType: TipoPerfil.Cliente,
      accessProfile: '',
      corporateName: participante.razaoSocial,
      businessName: participante.nome,
      cpfCnpj: participante.documento,
      userName: participante.documento,
      password: participante.documento,
      createdDate: new Date(),
      createdBy: user,
      observations: participante.telefone,
      addresses: [{
        addressType: 'Comercial',
        country: 'Brasil',
        postalCode: participante.cep,
        state: participante.cidade.estado,
        city: participante.cidade.nome,
        district: '',
        street: participante.logradouro,
        number: participante.numero,
        complement: participante.complemento,
        reference: '',
        isDefault: true,
      }],
      contacts: [{
        contactType: 'Telefone',
        contact: participante.telefone,
        isDefault: true,
      }, ...participante.contatos.map((contato: any) => ({
        contactType: 'Celular',
        contact: contato.celular,
        isDefault: false
      }))],
      emails: participante.contatos.map((contato: any, index: number) => ({
        emailType: 'Profissional',
        email: contato.email,
        isDefault: index === 0,
      }))
    };

    let created: any = null;

    try {
      created = await personApi.create(movideskPersonData);
      if (!created) {
        throw new Exceptions.EmptyResultFromMovideskException();
      }
    } catch (e) {
      try {
        const tipoDocumento = getTipoDocumento(participante.documento);
        const tipoParticipante = getSiglaParticipante(ehFornecedor);
        await notificationUseCases.addNotification(
          {
            categoriaId: notificacaoCategoriaEnum.movidesk,
            mensagem: `Falha ao integrar o participante ${participante.nome} (${tipoParticipante}: ${participanteId} /
            ${tipoDocumento}: ${participante.documento})`,
            dataExpiracao: DateTime.local().plus({ days: 5 }).toSQLDate(),
            usuarioNotificacao: {
              status: usuarioNotificacaoEnum.naoLido,
            }
          },
          [rolesEnum.boAdministrador], user);
      } catch (e) {
        logger.warn('Houve um erro ao salvar notificação de falha na integração');
        logger.error(e);
      }
      throw e;
    }

    const transaction = await db.transaction();
    const integracao = {
      participanteId,
      id: created.id,
      tipoIntegracao: ParticipanteIntegracaoTipo.movidesk,
      status: ParticipanteIntegracaoStatus.concluido,
      usuario: user
    };

    await db.entities.participanteIntegracao.create(integracao, { transaction });
    await transaction.commit();

    try {
      await notificationUseCases.addNotification(
        {
          categoriaId: notificacaoCategoriaEnum.movidesk,
          dataExpiracao: DateTime.local().plus({ days: 5 }).toSQLDate(),
          usuarioNotificacao: {
            status: usuarioNotificacaoEnum.naoLido,
          }
        },
        [rolesEnum.boAdministrador], user, participanteId);
    } catch (ex) {
      logger.warn('Houve um erro ao salvar notificação de sucesso na integração');
      logger.error(ex);
    }

    return true;
  } catch (e) {
    if (throwErrors) throw e;

    logger.warn('Houve um erro na Integração com o Movidesk, mas não foi impeditivo.');
    logger.error(e);
    return true;
  }
};

export default integrateWithMovideskUseCase;
