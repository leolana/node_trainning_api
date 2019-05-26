import saveHistory from '../../services/participante/saveHistory';
import mapFiles from '../../services/file/mapFiles';
import validateRange from '../../services/participante/validateRange';
import formatTax from '../../services/participante/formatTax';
import { Auth } from '../../../infra/auth';

const editUsecase = (
  db,
  siscofWrapper,
  auth: Auth,
  fileStorage
) => (data, files, user) => {
  const currentUser = null;

  const save = saveHistory(db);

  const find = participanteId => db.entities.participanteFornecedor
    .findOne({
      where: { participanteId },
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

  const validate = (supplier, fornecedor) => {
    if (!supplier) throw new Error('fornecedor-nao-encontrado');

    const participant = supplier.participante;

    fornecedor.documento = participant.documento;
    fornecedor.usuario = user;

    const rangeValid = validateRange(data.taxas.cessao);
    if (rangeValid) {
      throw (String(rangeValid));
    }

    return participant;
  };

  const uploadFiles = arquivos => Promise.all(
    arquivos.map(file => fileStorage.upload(file.name, file.content))
  );

  const persistData = (
    participanteData, participant, contato, arquivos, transaction
  ) => {
    const extratos = arquivos.map(f => f.key).concat(participanteData.unchangedFiles || []);

    participanteData.arquivos = {
      extratosBancarios: extratos,
    };

    participanteData.everyTax = participanteData.taxas.cessao.concat([participanteData.taxas.antecipacao]);

    participanteData.taxas = formatTax(participanteData.taxas, user);

    participanteData.taxas.forEach((t, i) => {
      if (t.participanteTaxaId) {
        delete participanteData.taxas[i];
      }
    });

    const domicilios = participanteData.domiciliosBancarios.sort((a, b) => {
      if (a.bandeiraId < b.bandeiraId) return -1;
      if (a.bandeiraId > b.bandeiraId) return 1;

      return 0;
    });

    const mapaDomicilios: { [key: string]: any[] } = {};

    const getKey = (i: number) => {
      const d = domicilios[i];
      return `${d.bancoId}${d.agencia}${d.conta}${d.digito}`;
    };

    const unchanged = [];

    // Mapear arquivos modificados em seus respectivos domicílios
    domicilios.forEach((d, i) => {
      if (!d.newFile) {
        unchanged.push(d);
        return;
      }

      const compare = getKey(i);

      const current = mapaDomicilios[compare] || [];

      current.push(d);

      mapaDomicilios[compare] = current;
    });

    const sorted = Object.values(mapaDomicilios).sort((a, b) => {
      if (a[0].bandeiraId < b[0].bandeiraId) return -1;
      if (a[0].bandeiraId > b[0].bandeiraId) return 1;
      return 0;
    });

    sorted.forEach((ds, i) => {
      ds.forEach((d) => {
        d.arquivo = arquivos[i].key;
      });
    });

    participanteData.domiciliosBancarios = [].concat.apply(unchanged, sorted);

    const participante = Object.assign(
      participant, participanteData
    );

    const promises = [
      participante.save({ transaction }),
    ];

    promises.push(
      db.entities.participanteTaxa.destroy(
        {
          transaction,
          where: {
            id: data.taxasHistorico.map(t => t.participanteTaxaId),
          },
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

    promises.push(
      db.entities.participanteDomicilioBancario.destroy(
        {
          transaction,
          where: {
            participanteId: participante.id,
          },
        }
      )
    );

    participante.contatos.forEach((c) => {
      if (c.ativo) {
        promises.push(
          c.update(
            {
              ativo: false,
            },
            { transaction })
        );
      }
    });

    promises.push(
      db.entities.participanteTaxaHistorico.bulkCreate(
        data.taxasHistorico.map(t => ({
          ...t,
          participanteId: participant.id,
        })),
        { transaction }
      )
    );

    contato.participanteId = participante.id;

    promises.push(
      db.entities.participanteContato.create(
        contato,
        { transaction }
      )
    );

    promises.push(
      db.entities.participanteDomicilioBancario.bulkCreate(
        participanteData.domiciliosBancarios.map(d => ({
          ...d,
          participanteId: participante.id,
        })),
        { transaction }
      )
    );

    return Promise.all(promises)
      .then(results => results[0]);
  };

  const findCity = cityId => db.entities.cidade.findOne({
    where: { id: cityId },
  });

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
    .then(participant => (mapFiles(files, data.documento, 'fornecedor')
      .then(uploadFiles)
      .then(uploadedFiles => db.transaction(
        t => persistData(data, participant, contact, uploadedFiles, t)
          .then(newParticipant => (
            Promise.all([
              findCity(newParticipant.cidadeId),
              save(newParticipant, t),
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
            return auth.updateUserStatus(currentUser.id, currentUser.ativo);
          }

          throw err;
        }))));
};

export default editUsecase;
