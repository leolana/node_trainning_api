import { DateTime } from 'luxon';

import participanteIndicacaoStatus from '../../../domain/entities/participanteIndicacaoStatus';

const rejectNomination = (db, mailer) => (document, reasonId, reason, user) => {
  const updateNomination = (
    documento, motivoTipoRecusaId, motivo, usuarioResposta
  ) => (db.models as any).ParticipanteIndicacao
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

  const findById = nominationId => (db.models as any).ParticipanteIndicacao
    .findById(nominationId[0]);

  const findEstablishment = (nomination) => {
    const contatoInclude = () => ({
      model: (db.models as any).ParticipanteContato,
      as: 'contatos',
      attributes: ['participanteId', 'email'],
      where: { ativo: true },
    });

    const participanteInclude = () => ({
      model: (db.models as any).Participante,
      as: 'participante',
      attributes: ['id', 'nome'],
      include: [contatoInclude()],
      where: { ativo: true },
    });

    return (db.models as any).ParticipanteEstabelecimento.findOne({
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
