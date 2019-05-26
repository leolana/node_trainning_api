const emailTemplates = require('../mailer/emailTemplates.enum');

module.exports = (db, mailer, mailerSettings) => (cession) => {
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

  const findSupplier = supplierId => db.entities.participanteFornecedor
    .findOne({
      where: { participanteId: supplierId },
      attributes: ['participanteId'],
      include: [participanteInclude()],
    });

  const findEstablishment = establishmentId => (
    db.entities.participanteEstabelecimento.findOne({
      where: { participanteId: establishmentId },
      attributes: ['participanteId'],
      include: [participanteInclude()],
    })
  );

  const sendMail = (id, recipient, template, options) => mailer
    .enviar({
      templateName: template,
      destinatary: recipient,
      substitutions: {
        codigoCessao: id,
        linkCessaoAprovacao: `${mailerSettings.baseUrl}/cessao/detalhe/${id}`,
        ...options,
      },
    });

  const sendMailSupplier = (id, recipient, name) => sendMail(
    id,
    recipient,
    emailTemplates.SOLICITAR_CESSAO_FORNECEDOR,
    { estabelecimento: name },
  );

  const sendMailEstablishment = (id, recipient, name) => sendMail(
    id,
    recipient,
    emailTemplates.SOLICITAR_CESSAO_ESTABELECIMENTO,
    { fornecedor: name },
  );

  const notify = (supplier, establishment) => Promise.all([
    sendMailSupplier(
      cession.id,
      supplier.participante.contatos[0].email,
      establishment.participante.nome
    ),
    sendMailEstablishment(
      cession.id,
      establishment.participante.contatos[0].email,
      supplier.participante.nome,
    ),
  ]);

  return Promise.all([
    findSupplier(
      cession.participanteVinculo.participanteFornecedorId
    ),
    findEstablishment(
      cession.participanteVinculo.participanteEstabelecimentoId
    ),
  ])
    .then(results => notify(...results));
};
