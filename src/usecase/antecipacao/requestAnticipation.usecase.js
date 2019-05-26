const { DateTime } = require('luxon');
const getHourLimit = require('../antecipacao/getHourLimit.usecase');

module.exports = (db, siscofWrapper) => (
  participanteId,
  user,
  recebiveis,
) => {
  const validateAnticipation = (hourLimit) => {
    const blockedDays = {
      0: 'sunday',
      6: 'saturday',
    };

    if (new Date().getDay() in blockedDays) {
      throw String('anticipation-blocked-day');
    }

    if (DateTime.local().toFormat('HH:mm') >= hourLimit) {
      throw String('anticipation-time-limit-exceeded');
    }
  };

  const persistAnticipation = (antecipacao, siscofData) => {
    const action = db.entities.antecipacao
      .create(antecipacao)
      .then(created => ({
        ...siscofData,
        antecipacaoId: created.id,
      }));

    return action;
  };

  const requestAnticipationSiscof = (antecipacao, recebiveisSiscof) => {
    const action = siscofWrapper
      .efetivarAntecipacao(recebiveisSiscof)
      .then(resultSiscof => persistAnticipation(antecipacao, resultSiscof));

    return action;
  };

  const requestAnticipation = () => {
    const antecipacao = {
      participanteId,
      usuario: user,
      dataPagamento: new Date(),
    };

    const recebiveisSiscof = {
      cessionario: participanteId,
      dataAntecipacao: new Date(),
      rowIds: recebiveis,
    };

    return requestAnticipationSiscof(antecipacao, recebiveisSiscof);
  };

  const persistReceivables = (data) => {
    const dados = data.movimentos.map(d => ({
      antecipacaoId: data.antecipacaoId,
      dataPagamento: d.dataPagamento,
      diasAntecipacao: d.diasAntecipacao,
      valorPagar: d.valorPagar,
      taxaAntecipacao: d.taxaAntecipacao,
      descontoAntecipacao: d.descontoAntecipacao,
      valorAntecipado: d.valorAntecipado,
      rowId: d.rowId,
      bandeiraId: d.bandeira,
      eventoId: d.evento,
    }));

    return db.entities.antecipacaoRecebivel.bulkCreate(dados);
  };

  return getHourLimit()
    .then(validateAnticipation)
    .then(requestAnticipation)
    .then(persistReceivables);
};
