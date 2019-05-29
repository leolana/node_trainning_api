import { DateTime } from 'luxon';

import participanteIndicacaoStatus from '../../../domain/entities/participanteIndicacaoStatus';

const rejectNomination = (db, mailer) => (document, reasonId, reason, user) => {
  const updateNomination = (
    documento, motivoTipoRecusaId, motivo, usuarioResposta
  ) => db.entities.participanteIndicacao
    .update(
    {
      motivoTipoRecusaId,
      motivo,
      usuarioResposta,
      status: participanteIndicacaoStatus.reprovado,
      dataFimIndicacao: DateTime.local() ,
    },
    {
      where: { documento }
    }
    );

  const findById = nominationId => db.entities.participanteIndicacao
    .findById(nominationId[0]);

  const findEstablishment = (nomination) => {
    const contatoInclude = () => ({
      model: db.entities.participanteContato,
      as: 'contatos',
      attributes: ['participanteId', 'email'],
      where: { ativo: true },
    });

    const participanteInclude = () => ({
      model: db.entities.participante,
      as: 'participante',
      attributes: ['id', 'nome'],
      include: [contatoInclude()],
      where: { ativo: true },
    });

    return db.entities.participanteEstabelecimento.findOne({
      where: {
        participanteId: nomination.participanteId,
      },
      attributes: ['participanteId'],
      include: [participanteInclude()],
    });
  };

  const notify = (establishment, documentoFornecedor) => {
    if (!establishment) {
      throw new Error('estabelecimento-nao-encontrado');
    }

    return mailer.enviar({
      templateName: mailer.emailTemplates.INDICACAO_FORNECEDOR_RECUSADA,
      destinatary: establishment.participante.contatos[0].email,
      substitutions: {
        fornecedor: documentoFornecedor,
      },
    });
  };

  return updateNomination(document, reasonId, reason, user)
    .then(findById)
    .then(findEstablishment)
    .then(establishment => notify(establishment, document));
};

export default rejectNomination;
