import { Sequelize } from 'sequelize-typescript';
import { Mailer } from '../../../infra/mailer';
import { MailerEnv } from '../../../infra/environment/Environment';
import { verifyPersonType } from '../../services/types/personTypeEnum';
import { LoggerInterface } from '../../../infra/logging';

import participateNominationSourceEnum from '../../entities/participateNominationSourceEnum';
import participanteVinculoStatus from '../../entities/participanteVinculoStatus';
import formatDocumento from '../../services/document/formatDocumento';
import emailTemplates from '../../../infra/mailer/emailTemplates';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const indicateProviderUseCase = (
  db: Sequelize,
  mailer: Mailer,
  mailerSettings: MailerEnv,
  logger: LoggerInterface) => async (
    nome: string,
    email: string,
    telefone: string,
    documento: string,
    participanteFornecedor: boolean,
    estabelecimentoComercialId: number
  ) => {
    const tipoPessoa = verifyPersonType(documento);
    const canalEntrada = participanteFornecedor
      ? participateNominationSourceEnum.indicacaoPorFornecedor
      : participateNominationSourceEnum.indicacaoPorEc;

    const statusPendente = participanteVinculoStatus.pendente;

    const participantes = await (db.models as any).participante.findAll({
      where: {
        id: estabelecimentoComercialId,
        ativo: true,
      },
      attributes: ['id', 'nome', 'razaoSocial'],
      include: [{
        model: (db.models as any).participanteIndicacao,
        as: 'indicacoes',
        attributes: ['id', 'documento'],
      }],
    });

    const estabelecimentoComercial = participantes.find(
      participante => participante.id === estabelecimentoComercialId
    );

    if (!estabelecimentoComercial) {
      throw new Exceptions.EstablishmentNotFoundException();
    }
    if (estabelecimentoComercial.indicacoes.some(indicacao => indicacao.documento === documento)) {
      throw new Exceptions.AlreadyNominatedProviderException();
    }

    await (db.models as any).participanteIndicacao.create({
      documento,
      nome,
      email,
      telefone,
      tipoPessoa,
      canalEntrada,
      statusPendente,
      participanteId: estabelecimentoComercialId,
      usuario: email
    });

    try {
      await mailer.enviar({
        templateName: emailTemplates.INDICACAO_FORNECEDOR_NAO_CADASTRADO,
        destinatary: email,
        substitutions: {
          estabelecimento: estabelecimentoComercial.razaoSocial
            || estabelecimentoComercial.nome,
          fornecedor: formatDocumento(documento),
          linkCessao: `${mailerSettings.baseUrl}/cessoes`,
        },
      });
    } catch (e) {
      logger.error(e);
    }

  };

export default indicateProviderUseCase;
