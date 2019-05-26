const listReceivables = (db, siscofWrapper) => (
  participanteId,
  mesInicio,
  mesFim,
  produtosId,
  bandeirasId,
  dataVendaInicio,
  dataVendaFim,
) => {
  const data: any = {};

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
        mesInicio,
        mesFim,
        bandeirasId,
        dataVendaInicio,
        dataVendaFim,
        cessionario: participanteId,
        produtoId: produtosId,
      })
      .then((resultSiscof) => {
        data.recebiveis = resultSiscof.movimentos;
      });
  }

  function mapRecebiveis() {
    data.recebiveis.forEach((r) => {
      const bandeira = data.bandeiras.find(b => b.id === r.bandeiraId);
      const evento = data.eventos.find(e => e.id === r.eventoId);
      r.bandeira = bandeira ? { ...bandeira.dataValues } : { nome: '-' };
      r.evento = evento ? { ...evento.dataValues } : { nome: '-' };
      if (r.valorPagar >= 0) return;
      r.bandeira.nome = '-';
      r.evento.nome = '-';
      r.diasAntecipacao = '-';
      r.taxaAntecipacao = '-';
      r.descontoAntecipacao = 0;

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

export default listReceivables;
