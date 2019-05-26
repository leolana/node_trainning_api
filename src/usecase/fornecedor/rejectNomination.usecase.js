// eslint-disable-next-line max-len
const indicacaoStatus = require('../../service/participante/nominationStatus.enum');
const emailTemplates = require('../../service/mailer/emailTemplates.enum');

module.exports = (db, mailer) => (document, reasonId, reason, user) => {
  const updateNomination = (
    document, reasonId, reason, user
  ) => db.entities.participanteIndicacao
    .update({
      status: indicacaoStatus.reprovado,
      usuarioResposta: user,
      motivo: reason,
      motivoTipoRecusaId: reasonId,
      dataFimIndicacao: new Date(),
    }, { where: { documento: document } });

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

  const notify = (establishment, document) => {
    if (!establishment) throw String('estabelecimento-nao-encontrado');

    return mailer.enviar({
      templateName: emailTemplates.INDICACAO_FORNECEDOR_RECUSADA,
      destinatary: establishment.participante.contatos[0].email,
      substitutions: {
        fornecedor: document,
      },
    });
  };

  return updateNomination(document, reasonId, reason, user)
    .then(findById)
    .then(findEstablishment)
    .then(establishment => notify(establishment, document));
};
