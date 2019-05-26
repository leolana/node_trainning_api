const history = require('../../service/participante/saveHistory.service');

const saveFiles = require('../../service/file/saveFiles.service');
// eslint-disable-next-line max-len
const validateRange = require('../../service/participante/validateRange.service');
const formatTax = require('../../service/participante/formatTax.service');

module.exports = (
  db,
  siscofWrapper,
  auth,
  fileStorage
) => (data, files, user) => {
  const currentUser = null;

  const saveHistory = history(db);

  const find = id => db.entities.participanteFornecedor
    .findOne({
      where: { participanteId: id },
      include: [
        {
          model: db.entities.participante,
          include: [
            {
              model: db.entities.participanteContato,
              as: 'contatos',
              where: { ativo: true },
            },
          ],
        },
      ],
    });

  const validate = (supplier, data) => {
    if (!supplier) throw String('fornecedor-nao-encontrado');

    const participant = supplier.participante;

    data.documento = participant.documento;
    data.usuario = user;

    const rangeValid = validateRange(data.taxas.cessao);
    if (rangeValid) {
      throw (String(rangeValid));
    }

    return participant;
  };

  const uploadFiles = files => Promise.all(
    files.map(file => fileStorage.upload(file.name, file.content))
  );

  const persistData = (
    data, participant, contact, files, transaction
  ) => {
    const extratos = files.map(f => f.key).concat(data.unchangedFiles || []);

    data.arquivos = {
      extratosBancarios: extratos,
    };

    data.everyTax = data.taxas.cessao.concat([data.taxas.antecipacao]);

    data.taxas = formatTax(data.taxas, user);


    data.taxas.forEach((t, i) => {
      if (t.participanteTaxaId) {
        delete data.taxas[i];
      }
    });

    participant = Object.assign(
      participant, data
    );

    const promises = [
      participant.save({ transaction }),
    ];

    promises.push(
      db.entities.participanteDomicilioBancario.destroy(
        {
          where: {
            participanteId: participant.id,
          },
          transaction,
        }
      )
    );


    promises.push(
      db.entities.participanteTaxa.destroy(
        {
          where: {
            id: data.taxasHistorico.map(t => t.participanteTaxaId),
          },
          transaction,
        }
      )
    );

    promises.push(
      db.entities.participanteTaxa.bulkCreate(
        data.taxas.map(t => ({
          ...t,
          participanteId: participant.id,
        })),
        { transaction }
      )
    );
    participant.contatos.forEach((c) => {
      if (c.ativo) {
        promises.push(
          c.update({
            ativo: false,
          }, { transaction })
        );
      }
    });

    contact.participanteId = participant.id;

    promises.push(
      db.entities.participanteContato.create(
        contact,
        { transaction }
      )
    );

    promises.push(
      db.entities.participanteDomicilioBancario.bulkCreate(
        data.domiciliosBancarios.map(d => ({
          ...d,
          participanteId: participant.id,
        })),
        { transaction }
      )
    );

    promises.push(
      db.entities.participanteTaxaHistorico.bulkCreate(
        data.taxasHistorico.map(t => ({
          ...t,
          participanteId: participant.id,
        })),
        { transaction }
      )
    );


    return Promise.all(promises)
      .then(results => results[0]);
  };

  function findCity(cityId) {
    return db.entities.cidade.findOne({
      where: { id: cityId },
    });
  }

  const validateModifyContact = (
    newParticipant, city
  ) => {
    newParticipant.cidade = city.nome;
    newParticipant.estado = city.estado;

    newParticipant.isAlteracao = true;

    const promises = [];

    return Promise.all(promises);
  };

  const { id } = data;
  const contact = data.contato;

  delete data.id;
  delete data.contato;

  return find(id)
    .then(supplier => validate(supplier, data))
    .then(participant => (saveFiles('fornecedor', files, data.documento)
      .then(uploadFiles)
      .then(uploadedFiles => db.transaction(
        t => persistData(data, participant, contact, uploadedFiles, t)
          .then(newParticipant => (
            Promise.all([
              findCity(newParticipant.cidadeId),
              saveHistory(newParticipant, t),
            ])
              .then(results => validateModifyContact(
                newParticipant, results[0]
              ))
              .then(() => siscofWrapper.incluirParticipante(
                newParticipant, false
              ))
          ))
      )
        .catch((err) => {
          if (currentUser) {
            auth.updateUserStatus(currentUser, currentUser.ativo);
          }

          throw err;
        }))));
};
