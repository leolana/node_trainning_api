// tslint:disable:no-magic-numbers
import deformatDocument from '../../services/credenciamento/deformatDocument';
import credenciamentoStatusEnum from '../../entities/credenciamentoStatusEnum';
import rateTypeEnum from '../../services/participante/rateTypeEnum';
import { CredenciamentoServices } from '../../services/credenciamento';
import { Sequelize } from 'sequelize-database';

const edit = (
  db: Sequelize,
  mailer,
  mailerSettings,
  services: CredenciamentoServices
) => (data, files, documento, user, unchangedFilesInitial) => {

  const document = deformatDocument(documento);

  let participanteExistente = null;
  let credenciamentoAnterior = null;
  let ratesChanged = false;
  let bankingDataChanged = false;

  const unchangedFiles = unchangedFilesInitial || [];

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

  const validate = (existing) => {
    if (!existing) throw new Error('registro-nao-encontrado');

    if ((existing.credenciamentos || []).length === 0) {
      throw new Error('registro-nao-encontrado');
    }

    participanteExistente = existing;

    credenciamentoAnterior = participanteExistente.credenciamentos[0];

    if (credenciamentoAnterior.status !== credenciamentoStatusEnum.aprovado) {
      throw new Error('credenciamento-status-invalido');
    }

    if (credenciamentoAnterior.documento !== document) {
      throw new Error('documento-informado-diferente-do-existente');
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
        throw new Error('taxa-debito-invalida');
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
        throw new Error('taxa-administrativa-invalida');
      }
    });

    const debitRates = [];
    const adminRates = [];

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

    data.condicaoComercial.antecipacao = data.condicaoComercial.taxaContratual;
    data.condicaoComercial.taxaContratual = credenciamentoAnterior.taxaContratualId;
    data.condicaoComercial.taxasDebito = debitRates;
    data.condicaoComercial.taxasAdministrativas = adminRates;
    data.credenciamento = { createdAt: credenciamentoAnterior.createdAt };
  };

  const checkUpdateRates = (current, newRate, usuarioCriacao, transaction) => {
    const getRates = () => db.entities.participanteTaxa
      .findAll({
        where: {
          participanteId: participanteExistente.id,
          participanteTaxaTipo: rateTypeEnum.antecipacao,
        },
      });

    const saveHistory = rates => db.entities.participanteTaxaHistorico
      .bulkCreate(
        rates.map(r => ({
          usuarioCriacao,
          participanteTaxaId: r.id,
          valorInicio: r.valorInicio,
          valorFim: r.valorFim,
          taxa: r.taxa,
          participanteId: r.participanteId,
          dataInclusao: r.createdAt,
          participanteTaxaTipo: r.participanteTaxaTipo,
        })),
        { transaction }
      );

    const deleteCurrent = () => db.entities.participanteTaxa
      .destroy({
        transaction,
        where: {
          participanteId: participanteExistente.id,
          participanteTaxaTipo: rateTypeEnum.antecipacao,
        },
      });

    const saveNew = () => {
      const model = {
        valorInicio: null,
        valorFim: null,
        taxa: newRate.antecipacao,
        participanteId: participanteExistente.id,
        usuarioCriacao: user,
        participanteTaxaTipo: rateTypeEnum.antecipacao,
      };

      return db.entities.participanteTaxa
        .create(model, { transaction, returning: true });
    };

    const validateRates = (rates) => {
      const ratesList = rates || [];
      let modified = false;

      // Por enquanto somente um valor de antecipação é cadastrado
      for (const rate of ratesList) {
        if (rate.taxa !== newRate.antecipacao) {
          modified = true;
          break;
        }
      }

      if (modified) {
        return saveHistory(ratesList)
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
      .then(validateRates)
      .then(() => current);
  };

  const updateAccreditation = (transaction: any) => {
    return credenciamentoAnterior.update(
      { ativo: false },
      { transaction },
    );
  };

  const updateTerms = (transaction: any) => {
    return db.entities.participanteAceiteTermo.update(
      { usuario: user },
      {
        transaction,
        where: {
          participanteId: participanteExistente.id,
        },
      },
    );
  };

  const checkBankingData = (newParticipant) => {
    const bankingDataMap = {};
    participanteExistente.domiciliosBancarios.forEach((d) => {
      bankingDataMap[d.bandeiraId] = d;
    });

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

    return newParticipant;
  };

  const notify = (newParticipant) => {
    const action = ratesChanged || bankingDataChanged
      ? mailer.enviar({
        templateName: mailer.emailTemplates.CREDENCIAMENTO_VALORES_ALTERADOS,
        destinatary: mailerSettings.mailingList,
        substitutions: {
          user,
          estabelecimento: participanteExistente.nome,
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
        services.mutateService(data, credenciamentoAnterior.status, files, document, user, unchangedFiles, t),
        updateAccreditation(t),
        updateTerms(t),
      ])
        .then(results => services.findService(results[0].id, t))
        .then(current => checkUpdateRates(
          current, data.condicaoComercial.antecipacao, user, t
        ))
        .then(updated => services.approveService(updated, user, participanteExistente, t))
        .then(checkBankingData)
        .then(notify)
    ));
};

export default edit;
