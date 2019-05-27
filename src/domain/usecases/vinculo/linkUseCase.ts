import { Sequelize } from 'sequelize-database';
import { SiscofWrapper } from '../../../infra/siscof';
import { Mailer } from '../../../infra/mailer';
import { MailerEnv } from '../../../infra/environment/Environment';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import participanteVinculoStatus from '../../entities/participanteVinculoStatus';
import emailTemplates from '../../../infra/mailer/emailTemplates';
import { logger } from '@sentry/utils';

const linkUseCase = (db: Sequelize, siscofWrapper: SiscofWrapper, mailer: Mailer, mailerSettings: MailerEnv) => async (
  solicitadoEstabelecimento: boolean,
  participante: string,
  email: string,
  estabelecimentoId: number,
  fornId: number,
) => {

  const estabelecimentoComercialId = solicitadoEstabelecimento
    ? participante
    : estabelecimentoId;

  const fornecedorId = !solicitadoEstabelecimento
    ? participante
    : fornId;

  if (estabelecimentoComercialId === fornecedorId) {
    throw new Exceptions.InvalidBoundBetweenSameParticipantException();
  }

  const contatoInclude = {
    model: db.entities.participanteContato,
    as: 'contatos',
    attributes: ['participanteId', 'email'],
    where: { ativo: true },
  };

  const participanteInclude = {
    model: db.entities.participante,
    as: 'participante',
    attributes: ['id', 'nome'],
    include: [contatoInclude],
    where: { ativo: true },
  };

  const vinculoInclude = {
    model: db.entities.participanteVinculo,
    as: 'vinculos',
    attributes: [
      'id',
      'participanteEstabelecimentoId',
      'participanteFornecedorId',
    ],
  };

  const createParticipanteVinculo = async (
    participanteEstabelecimentoId,
    participanteFornecedorId,
    estabelecimentoSolicitouVinculo,
    statusVinculo
  ) => db.entities.participanteVinculo.create({
    participanteEstabelecimentoId,
    participanteFornecedorId,
    estabelecimentoSolicitouVinculo,
    usuario: email,
    exibeValorDisponivel: true,
    diasAprovacao: 2,
    status: statusVinculo,
    usuarioRespostaEstabelecimento: email,
  });

  const [fornecedor, estabelecimento] = await Promise.all([
    db.entities.participanteFornecedor.findOne({
      where: { participanteId: fornId },
      attributes: ['participanteId'],
      include: [participanteInclude, vinculoInclude],
    }),
    db.entities.participanteEstabelecimento.findOne({
      where: { participanteId: estabelecimentoComercialId },
      attributes: ['participanteId'],
      include: [participanteInclude, vinculoInclude],
    })]);

  if (!estabelecimento) {
    throw new Exceptions.EstablishmentNotFoundException();
  }

  if (!fornecedor) {
    throw new Exceptions.ProviderNotFoundException();
  }

  if (solicitadoEstabelecimento && estabelecimento.vinculos.some(
    f => f.participanteFornecedorId === fornecedorId
  )) {
    throw new Exceptions.FornecedorLinked();
  }

  if (!solicitadoEstabelecimento && fornecedor.vinculos.some(
    f => f.participanteEstabelecimentoId === estabelecimentoComercialId
  )) {
    throw new Exceptions.EstabelecimentoLinked();
  }

  if (solicitadoEstabelecimento) {
    await siscofWrapper
      .incluirExcluirCessionarioEC(fornecedorId, estabelecimentoComercialId, participanteVinculoStatus.aprovado);
    await createParticipanteVinculo(
      estabelecimentoComercialId,
      fornecedorId,
      solicitadoEstabelecimento,
      participanteVinculoStatus.aprovado
    );

    mailer.enviar({
      templateName: emailTemplates.INDICACAO_FORNECEDOR_CADASTRADO,
      destinatary: fornecedor.participante.contatos[0].email,
      substitutions: {
        estabelecimento: estabelecimento.participante.nome,
        linkSolicitarCessao: `${mailerSettings.baseUrl}/fornecedor/estabelecimentos`,
      },
    }).catch(error => logger.error(error));

    mailer.enviar({
      templateName: emailTemplates.INDICACAO_FORNECEDOR_CADASTRADO_ESTABELECIMENTO,
      destinatary: email,
      substitutions: {
        fornecedor: fornecedor.participante.nome,
        linkSolicitarCessaoPendentes: `${mailerSettings.baseUrl}/estabelecimento/fornecedores`,
      },
    }).catch(error => logger.error(error));

    return;
  }

  await createParticipanteVinculo(
    estabelecimentoComercialId,
    fornecedorId,
    solicitadoEstabelecimento,
    participanteVinculoStatus.pendente
  );
  mailer.enviar({
    templateName: emailTemplates.INDICACAO_ESTABELECIMENTO_CADASTRADO,
    destinatary: estabelecimento.participante.contatos[0].email,
    substitutions: {
      fornecedor: fornecedor.participante.nome,
      linkFornecedoresCessao: `${mailerSettings.baseUrl}/estabelecimento/fornecedores`,
    },
  }).catch(error => logger.error(error));

  mailer.enviar({
    templateName: emailTemplates.INDICACAO_ESTABELECIMENTO_FORNECEDOR,
    destinatary: email,
    substitutions: {
      estabelecimento: estabelecimento.participante.nome,
      linkSolicitarCessao: `${mailerSettings.baseUrl}/fornecedor/estabelecimentos`,
    },
  }).catch(error => logger.error(error));
};

export default linkUseCase;
