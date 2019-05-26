const credenciamentoStatus = require('./accreditationStatus.enum');
const tiposPessoa = require('../participante/personType.enum');
const tipoTaxa = require('../../service/participante/rateType.enum');

module.exports = (db, auth, siscofWrapper) => (
  credenciamento,
  user,
  participanteExistente,
  transaction
) => {
  let participante = null;
  let participanteId = null;

  const validate = () => {
    if (!credenciamento) throw String('registro-nao-encontrado');

    if (credenciamento.status !== credenciamentoStatus.emAnalise
      && !participanteExistente) throw String('credenciamento-status-invalido');
  };

  const assembleData = () => {
    credenciamento.status = credenciamentoStatus.aprovado;

    participante = Object.assign({}, credenciamento.dataValues);
    delete participante.id;
    delete credenciamento.contato.dataValues.id;

    participante.contatos = [credenciamento.contato.dataValues];
    participante.socios = credenciamento.socios.reduce((aggregate, s) => {
      delete s.dataValues.id;
      aggregate.push(s.dataValues);
      return aggregate;
    }, []);

    participante.domiciliosBancarios = credenciamento.domiciliosBancarios
      .reduce((aggregate, s) => {
        delete s.dataValues.id;
        aggregate.push(s.dataValues);
        return aggregate;
      }, []);
  };

  const getSiscofId = documento => db.entities.participanteExistenteSiscof
    .findOne({ where: { documento } })
    .then((result) => {
      if ((result || null) != null) {
        return result.participanteId;
      }
      return null;
    });

  const checkId = () => (
    participanteExistente
      ? participanteExistente.id
      : getSiscofId(participante.documento)
  );

  const composePersistNew = () => {
    const includes = [
      {
        model: db.entities.participanteDomicilioBancario,
        as: 'domiciliosBancarios',
      },
      {
        model: db.entities.participanteContato,
        as: 'contatos',
      },
      {
        model: db.entities.participanteTaxa,
        as: 'taxas',
      },
    ];

    if (+participante.tipoPessoa === tiposPessoa.juridica) {
      includes.push({ model: db.entities.participanteSocio, as: 'socios' });
    }

    participante.taxas = [{
      valorInicio: null,
      valorFim: null,
      taxa: participante.taxaContratual.antecipacao,
      usuarioCriacao: user,
      participanteTaxaTipo: tipoTaxa.antecipacao,
    }];

    return [
      db.entities.participante
        .create(participante, {
          include: includes,
          transaction,
        }),
    ];
  };

  const composePersistExisting = () => {
    const newValues = {
      contatos: participante.contatos,
      socios: participante.socios,
      domiciliosBancarios: participante.domiciliosBancarios,
    };

    newValues.contatos.forEach((c) => {
      c.participanteId = participante.id;
    });

    newValues.socios.forEach((s) => {
      s.participanteId = participante.id;
    });

    newValues.domiciliosBancarios.forEach((d) => {
      d.participanteId = participante.id;
    });

    participante.usuario = user;

    const promises = [
      db.entities.participante.update(
        participante,
        {
          where: { id: participante.id },
          transaction,
          returning: true,
        }
      ).then(r => Object.assign(r[1][0], participante)),
      db.entities.participanteContato.destroy({
        where: { participanteId: participante.id },
        transaction,
      }),
      db.entities.participanteSocio.destroy({
        where: { participanteId: participante.id },
        transaction,
      }),
      db.entities.participanteDomicilioBancario.destroy({
        where: { participanteId: participante.id },
        transaction,
      }),
      db.entities.participanteContato.bulkCreate(
        newValues.contatos,
        { transaction },
      ),
      db.entities.participanteDomicilioBancario.bulkCreate(
        newValues.domiciliosBancarios,
        { transaction },
      ),
    ];

    if (+participante.tipoPessoa === tiposPessoa.juridica) {
      promises.push(
        db.entities.participanteSocio.bulkCreate(
          newValues.socios,
          { transaction },
        )
      );
    }

    return promises;
  };

  const persistData = (existingId) => {
    const composePersist = participanteExistente
      ? composePersistExisting
      : composePersistNew;

    if (existingId != null) {
      participante.id = existingId;
      participanteId = existingId;
    }

    const approve = db.entities.credenciamentoAprovacao.create({
      credenciamentoId: credenciamento.id,
      status: credenciamentoStatus.aprovado,
      usuario: user,
      observacao: participanteExistente ? 'auto-approved' : '',
    }, { transaction });

    return Promise.all([approve, ...composePersist()])
      .then(results => results[1]);
  };

  const associateAsEstablishment = (newParticipant) => {
    credenciamento.participanteId = newParticipant.id;
    newParticipant.credenciamento = credenciamento;

    const save = credenciamento.save({ transaction });
    let saveAsEc = null;

    if (participanteExistente) {
      newParticipant.isAlteracao = true;
      saveAsEc = Promise.resolve();
    } else {
      saveAsEc = db.entities.participanteEstabelecimento.create({
        participanteId: newParticipant.id,
      }, { transaction });
    }

    return Promise.all([save, saveAsEc])
      .then(() => newParticipant);
  };

  const syncSiscof = (newParticipant) => {
    // Valor necessário para envio ao siscof
    newParticipant.taxaContratual = newParticipant
      .credenciamento.taxaContratual;

    const action = participanteId == null || participanteExistente != null
      ? siscofWrapper.incluirParticipante(newParticipant, true)
      : Promise.resolve();

    return action
      .then(() => newParticipant);
  };

  return Promise.resolve(validate())
    .then(assembleData)
    .then(checkId)
    .then(persistData)
    .then(associateAsEstablishment)
    .then(syncSiscof);
};
