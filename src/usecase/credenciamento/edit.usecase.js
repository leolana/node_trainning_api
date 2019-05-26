const mutateService = require('../../service/credenciamento/mutate.service');
const approveService = require('../../service/credenciamento/approve.service');
const findService = require('../../service/credenciamento/find.service');
// eslint-disable-next-line max-len
const deformatDocument = require('../../service/credenciamento/deformatDocument.service');

// eslint-disable-next-line max-len
const credenciamentoStatus = require('../../service/credenciamento/accreditationStatus.enum');
const emailTemplates = require('../../service/mailer/emailTemplates.enum');
const tipoTaxa = require('../../service/participante/rateType.enum');

module.exports = (
  db,
  auth,
  fileStorage,
  siscofWrapper,
  mailer,
  mailerSettings
) => (
  data,
  files,
  documento,
  user,
  unchangedFiles
) => {
  documento = deformatDocument(documento);

  const mutate = mutateService(db, fileStorage);
  const approve = approveService(db, auth, siscofWrapper);
  const find = findService(db);

  let participanteExistente = null;
  let credenciamentoAnterior = null;
  let ratesChanged = false;
  let bankingDataChanged = false;

  unchangedFiles = unchangedFiles || [];

  const findExisting = id => db.entities.participante.findOne({
    include: [
      {
        model: db.entities.participanteContato,
        as: 'contatos',
        required: false,
        where: { ativo: true },
      },
      {
        model: db.entities.participanteDomicilioBancario,
        as: 'domiciliosBancarios',
      },
      {
        model: db.entities.participanteTaxa,
        as: 'taxas',
      },
      {
        model: db.entities.credenciamento,
        as: 'credenciamentos',
        required: true,
        where: {
          id,
          ativo: true,
        },
        include: [
          {
            model: db.entities.credenciamentoTaxaAdministrativa,
            as: 'taxasAdministrativas',
          },
          {
            model: db.entities.credenciamentoTaxaDebito,
            as: 'taxasDebito',
          },
        ],
      },
    ],
  });

  const validate = (exisiting) => {
    if (!exisiting) throw String('registro-nao-encontrado');

    if ((exisiting.credenciamentos || []).length === 0) {
      throw String('registro-nao-encontrado');
    }

    participanteExistente = exisiting;

    // eslint-disable-next-line prefer-destructuring
    credenciamentoAnterior = participanteExistente.credenciamentos[0];

    if (credenciamentoAnterior.status !== credenciamentoStatus.aprovado) {
      throw String('credenciamento-status-invalido');
    }

    if (credenciamentoAnterior.documento !== documento) {
      throw String('documento-informado-diferente-do-existente');
    }

    if ((credenciamentoAnterior.arquivos.analises || []).length > 0) {
      unchangedFiles.analises = credenciamentoAnterior.arquivos.analises;
    }

    const debitRatesMap = {};
    const adminRatesMap = {};

    credenciamentoAnterior.taxasDebito.forEach((t) => {
      debitRatesMap[t.taxaBandeiraId] = t;
    });

    credenciamentoAnterior.taxasAdministrativas.forEach((t) => {
      adminRatesMap[t.taxaAdministrativaId] = t;
    });

    data.condicaoComercial.taxasDebito.forEach((t) => {
      if (t.id in debitRatesMap) {
        if (+Number(debitRatesMap[t.id].valor).toFixed(2)
          !== +Number(t.valor).toFixed(2)) {
          ratesChanged = true;
        }

        debitRatesMap[t.id].valor = t.valor;
      } else {
        throw String('taxa-debito-invalida');
      }
    });

    data.condicaoComercial.taxasAdministrativas.forEach((t) => {
      if (t.id in adminRatesMap) {
        if (+Number(adminRatesMap[t.id].valor).toFixed(2)
          !== +Number(t.valor).toFixed(2)) {
          ratesChanged = true;
        }

        adminRatesMap[t.id].valor = t.valor;
      } else {
        throw String('taxa-administrativa-invalida');
      }
    });

    const debitRates = [];
    const adminRates = [];

    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-prototype-builtins */
    for (const t in debitRatesMap) {
      if (debitRatesMap.hasOwnProperty(t)) {
        debitRates.push({
          id: t,
          valor: debitRatesMap[t].valor,
        });
      }
    }

    for (const t in adminRatesMap) {
      if (adminRatesMap.hasOwnProperty(t)) {
        adminRates.push({
          id: t,
          valor: adminRatesMap[t].valor,
        });
      }
    }
    /* eslint-enable no-restricted-syntax */
    /* eslint-enable no-prototype-builtins */

    data.condicaoComercial.antecipacao = data.condicaoComercial.taxaContratual;
    // eslint-disable-next-line max-len
    data.condicaoComercial.taxaContratual = credenciamentoAnterior.taxaContratualId;
    data.condicaoComercial.taxasDebito = debitRates;
    data.condicaoComercial.taxasAdministrativas = adminRates;
  };

  const updateAccreditation = transaction => credenciamentoAnterior.update(
    { ativo: false },
    { transaction },
  );

  const updateTerms = transaction => db.entities.participanteAceiteTermo.update(
    { usuario: user },
    {
      where: {
        participanteId: participanteExistente.id,
      },
      transaction,
    },
  );

  const checkUpdateRates = (current, newRate, user, transaction) => {
    const getRates = () => db.entities.participanteTaxa
      .findAll({
        where: {
          participanteId: participanteExistente.id,
          participanteTaxaTipo: tipoTaxa.antecipacao,
        },
      });

    const saveHistory = rates => db.entities.participanteTaxaHistorico
      .bulkCreate(rates.map(r => ({
        participanteTaxaId: r.id,
        valorInicio: r.valorInicio,
        valorFim: r.valorFim,
        taxa: r.taxa,
        participanteId: r.participanteId,
        usuarioCriacao: user,
        dataInclusao: r.createdAt,
        participanteTaxaTipo: r.participanteTaxaTipo,
      })), { transaction });

    const deleteCurrent = () => db.entities.participanteTaxa
      .destroy({
        where: {
          participanteId: participanteExistente.id,
          participanteTaxaTipo: tipoTaxa.antecipacao,
        },
        transaction,
      });

    const saveNew = () => db.entities.participanteTaxa
      .create({
        valorInicio: null,
        valorFim: null,
        taxa: newRate.antecipacao,
        participanteId: participanteExistente.id,
        usuarioCriacao: user,
        participanteTaxaTipo: tipoTaxa.antecipacao,
      },
      {
        transaction,
        returning: true,
      });

    const validate = (rates) => {
      rates = rates || [];
      let modified = false;

      // Por enquanto somente um valor de antecipação é cadastrado
      for (let i = 0; i < rates.length; i++) {
        const rate = rates[i];
        if (rate.taxa !== newRate.antecipacao) {
          modified = true;
          break;
        }
      }

      if (modified) {
        return saveHistory(rates)
          .then(deleteCurrent)
          .then(saveNew)
          .then(() => {
            current.taxaContratual.antecipacao = newRate.antecipacao;
            return current;
          });
      }

      return Promise.resolve();
    };

    return getRates()
      .then(validate)
      .then(() => current);
  };

  const checkBankingData = (newParticipant) => {
    const bankingDataMap = {};

    participanteExistente.domiciliosBancarios.forEach((d) => {
      bankingDataMap[d.bandeiraId] = d;
    });

    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-prototype-builtins */
    newParticipant.domiciliosBancarios.forEach((d) => {
      if (d.bandeiraId in bankingDataMap) {
        for (const prop in d) {
          if (d.hasOwnProperty(prop)) {
            if (prop !== 'credenciamentoId'
            && prop !== 'createdAt'
            && prop !== 'updatedAt'
            && bankingDataMap[d.bandeiraId][prop] !== d[prop]) {
              bankingDataChanged = true;
              break;
            }
          }
        }
      } else {
        bankingDataChanged = true;
      }
    });
    /* eslint-enable no-restricted-syntax */
    /* eslint-enable no-prototype-builtins */

    return newParticipant;
  };

  const notify = (newParticipant) => {
    const action = ratesChanged || bankingDataChanged
      ? mailer.enviar({
        templateName: emailTemplates.CREDENCIAMENTO_VALORES_ALTERADOS,
        destinatary: mailerSettings.mailingList,
        substitutions: {
          estabelecimento: participanteExistente.nome,
          user,
          linkCredenciamento:
            `${mailerSettings.baseUrl}/`
            + `credenciamento/${newParticipant.id}`,
          taxa: ratesChanged,
          bancario: bankingDataChanged,
        },
      })
      : Promise.resolve();

    return action
      .then(() => newParticipant);
  };

  return findExisting(data.dadosCadastrais.id)
    .then(validate)
    .then(() => db.transaction(
      t => Promise.all([
        mutate(data, files, documento, user, unchangedFiles, t),
        updateAccreditation(t),
        updateTerms(t),
      ])
        .then(results => find(results[0].id, t))
        .then(current => checkUpdateRates(
          current, data.condicaoComercial.antecipacao, user, t
        ))
        .then(updated => approve(updated, user, participanteExistente, t))
        .then(checkBankingData)
        .then(notify)
    ));
};
