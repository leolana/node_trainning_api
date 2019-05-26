module.exports = (db, siscofWrapper) => (
  participanteId,
  mesInicio,
  mesFim,
  produtosId,
  bandeirasId,
  dataVendaInicio,
  dataVendaFim,
) => {
  const data = {};

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

  function listRecebiveis() {
    return siscofWrapper
      .listarMovimentosParaAntecipar({
        cessionario: participanteId,
        mesInicio,
        mesFim,
        produtoId: produtosId,
        bandeirasId,
        dataVendaInicio,
        dataVendaFim,
      })
      .then((resultSiscof) => {
        data.recebiveis = resultSiscof.movimentos;
      });
  }

  function mapRecebiveis() {
    data.recebiveis.forEach((r) => {
      r.bandeira = data.bandeiras.find(b => b.id === r.bandeiraId);
      r.evento = data.eventos.find(e => e.id === r.eventoId);
      if (r.valorPagar < 0) {
        if (r.bandeira) {
          r.bandeira.nome = '-';
        }
        if (r.evento) {
          r.evento.nome = '-';
        }
        r.diasAntecipacao = '-';
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
      listRecebiveis(),
    ])
    .then(mapRecebiveis);
};
