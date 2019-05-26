const { DateTime } = require('luxon');

// eslint-disable-next-line max-len
const findService = require('../../service/credenciamento/find.service');
const approveService = require('../../service/credenciamento/approve.service');

const { defaultApprovingDays } = require('../../service/vinculo/config');

const termoTipo = require('../../service/termo/type.enum');
// eslint-disable-next-line max-len
const indicacaoStatus = require('../../service/participante/nominationStatus.enum');
const vinculoStatus = require('../../service/vinculo/status.enum');
const roles = require('../../service/auth/roles.enum');

const now = DateTime.local();

const effectiveDate = {
  inicio: { $lte: now.toSQLDate() },
  fim: {
    $or: {
      $eq: null,
      $gte: now.toSQLDate(),
    },
  },
};

module.exports = (db, auth, siscofWrapper) => (id, user) => {
  const approve = approveService(db, auth, siscofWrapper);
  const find = findService(db);

  let participantId = null;

  const findTerm = transaction => db.entities.termo.findOne({
    where: {
      ...effectiveDate,
      tipo: termoTipo.contratoMaeEstabelecimento,
    },
    attributes: ['id'],
  }, transaction);

  const acceptTerm = (term, transaction) => {
    if (!term) throw String('termo-nao-encontrado');

    return db.entities.participanteAceiteTermo.create({
      participanteId: participantId,
      termoId: term.id,
      usuario: user,
    }, { transaction });
  };

  const inviteUser = (newParticipant, transaction) => auth.inviteUser({
    nome: newParticipant.contatos[0].nome,
    email: newParticipant.contatos[0].email,
    celular: newParticipant.contatos[0].celular,
    roles: [roles.ecAdministrador],
    convidadoPor: user,
    participante: newParticipant.id,
  }, transaction);

  const getNominations = document => db.entities.participanteIndicacao.findAll({
    attributes: ['id', 'participanteId', 'usuario'],
    where: {
      documento: document,
    },
  });

  const updateNominations = (nominations, user, transaction) => Promise.all(
    nominations.map(n => n.update(
      {
        status: indicacaoStatus.aprovado,
        usuarioResposta: user,
        dataFimIndicacao: new Date(),
      },
      { transaction }
    ))
  );

  const createLinks = (nominations, transaction) => Promise.all(
    nominations.map(n => db.entities.participanteVinculo.create(
      {
        participanteEstabelecimentoId: participantId,
        participanteFornecedorId: n.participanteId,
        usuario: n.usuario,
        exibeValorDisponivel: true,
        diasAprovacao: defaultApprovingDays,
        estabelecimentoSolicitouVinculo: false,
        status: vinculoStatus.pendente,
      },
      { transaction }
    ))
  );

  return find(id)
    .then(credenciamento => db.transaction(
      t => approve(
        credenciamento,
        user,
        null,
        t
      )
        .then((participant) => {
          participantId = participant.id;
          return Promise.all([
            findTerm(t)
              .then(term => acceptTerm(term, t)),
            inviteUser(participant, t),
            getNominations(credenciamento.documento)
              .then(nominations => Promise.all([
                updateNominations(nominations, user, t),
                createLinks(nominations, t),
              ])),
          ]);
        })
    )
      .then(() => credenciamento));
};
