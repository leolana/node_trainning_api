const { DateTime } = require('luxon');

module.exports = (db, siscofWrapper) => (
  participanteId,
  dataPagamento,
  dataSolicitacao,
  bandeirasIds,
  produtosId,
  codigo,
  mes,
  dataSolicitacaoInicio,
  dataSolicitacaoFim,
) => {
  const data = {};
  let firstDay = null;
  let lastDay = null;

  if (mes) {
    firstDay = DateTime.fromISO(mes).set({ day: 1 }).toJSDate();
    lastDay = DateTime.fromISO(mes).endOf('month').toJSDate();
  }

  if (dataSolicitacaoInicio) {
    firstDay = DateTime.fromISO(dataSolicitacaoInicio).toJSDate();
  }

  if (dataSolicitacaoFim) {
    lastDay = DateTime.fromISO(dataSolicitacaoFim).toJSDate();
  }

  function listBandeiras() {
    return db.entities.bandeira
      .findAll({
        attributes: ['id', 'nome'],
      })
      .then((arr) => {
        data.bandeiras = arr;
      });
  }

  function listEventos() {
    return db.entities.evento
      .findAll({
        attributes: ['id', 'nome'],
      })
      .then((arr) => {
        data.eventos = arr;
      });
  }

  function getAntecipacoesRealizadasSiscof() {
    return siscofWrapper
      .consultarAntecipacaoRealizada({
        cessionario: participanteId,
        mesInicio: firstDay,
        mesFim: lastDay,
        bandeirasId: bandeirasIds,
        produtoId: produtosId,
        dataPagamento,
        dataSolicitacao,
        codigo,
      })
      .then((resultSiscof) => {
        data.recebiveis = resultSiscof.movimentos;
      });
  }
  function mapRecebiveis() {
    data.recebiveis.forEach((r) => {
      r.bandeira = data.bandeiras.find(b => b.id === r.bandeiraId);
      r.evento = data.eventos.find(e => e.id === r.eventoId);
      if (r.valorPagar < 0 || r.valorSolicitado < 0) {
        r.taxaAntecipacao = '-';
        r.descontoAntecipacao = 0;
      }
    });
    return data.recebiveis;
  }

  return Promise
    .all([
      listBandeiras(),
      listEventos(),
      getAntecipacoesRealizadasSiscof(),
    ])
    .then(mapRecebiveis);
};
