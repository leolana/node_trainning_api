const { DateTime } = require('luxon');
const useCases = require('../usecase/antecipacao/index');

const controller = (db, siscofWrapper) => {
  const anticipation = useCases(db, siscofWrapper);

  this.obterRecebiveis = (req, res) => {
    const body = req.body || {};
    const participanteId = req.user.participante;
    const mes = body.mes || null;

    let mesInicio = null;
    let mesFim = null;
    let produtosId = body.produtoId || body.produtosId || null;
    let bandeirasId = body.bandeirasId || null;
    const dataVendaInicio = body.dataVendaInicio
      ? DateTime.fromISO(body.dataVendaInicio).toISODate()
      : null;

    const dataVendaFim = body.dataVendaFim
      ? DateTime.fromISO(body.dataVendaFim).toISODate()
      : null;

    if (bandeirasId instanceof Array) {
      bandeirasId = bandeirasId.length === 0
        ? null : bandeirasId.map(id => +id);
    }

    if (produtosId instanceof Array) {
      produtosId = produtosId.length === 0 ? null : produtosId.map(id => +id);
    } else if (produtosId) {
      produtosId = [produtosId];
    }

    if (mes) {
      mesInicio = DateTime.fromISO(mes).set({ day: 1 }).toISODate();
      mesFim = DateTime.fromISO(mes).endOf('month').toISODate();
    }

    return anticipation
      .listReceivables(participanteId, mesInicio, mesFim, produtosId,
        bandeirasId, dataVendaInicio, dataVendaFim)
      .then(recebiveis => res.send(recebiveis))
      .catch(error => res.catch(error));
  };

  this.obterRealizadas = (req, res) => {
    const body = req.body || {};

    const codigo = body.codigo || null;
    const participanteId = req.user.participante;
    const mes = body.mes || null;

    const dataPagamento = body.dataPagamento
      ? new Date(body.dataPagamento)
      : null;

    const dataSolicitacao = body.dataSolicitacao
      ? new Date(body.dataSolicitacao)
      : null;

    const dataSolicitacaoInicio = body.dataSolicitacaoInicio || null;
    const dataSolicitacaoFim = body.dataSolicitacaoFim || null;

    let bandeirasIds = body.bandeirasIds || null;
    if (bandeirasIds instanceof Array) {
      bandeirasIds = bandeirasIds.length === 0
        ? null : bandeirasIds.map(id => +id);
    }

    let produtosId = body.produtoId || null;
    if (produtosId instanceof Array) {
      produtosId = produtosId.length === 0 ? null : produtosId.map(id => +id);
    } else if (produtosId) {
      produtosId = [produtosId];
    }

    return anticipation
      .listRealized(participanteId, dataPagamento, dataSolicitacao,
        bandeirasIds, produtosId, codigo, mes,
        dataSolicitacaoInicio, dataSolicitacaoFim)
      .then(data => res.send(data))
      .catch(error => res.catch(error));
  };

  this.solicitarAntecipacao = (req, res) => {
    if (!req.body) {
      throw String('parametro-invalido');
    }

    if (!(req.body.recebiveis || []).length) {
      throw String('lista-recebiveis-vazia');
    }

    const idParticipante = req.user.participante;
    const user = req.user.email;
    const receivables = req.body.recebiveis;

    return anticipation
      .requestAnticipation(idParticipante, user, receivables)
      .then(() => res.end())
      .catch(error => res.catch(error));
  };

  this.obterComboMeses = (req, res) => {
    const quantityMonths = 12;
    const startingDate = new Date();

    return anticipation
      .getMonthsDropdown(quantityMonths, startingDate)
      .then(arr => res.send(arr))
      .catch(error => res.catch(error));
  };

  this.obterComboProdutos = (req, res) => {
    const ehEstabelecimento = req.user.participanteEstabelecimento;
    const ehFornecedor = req.user.participanteFornecedor;

    return anticipation
      .getProductsDropdown(ehEstabelecimento, ehFornecedor)
      .then(arr => res.send(arr))
      .catch(error => res.catch(error));
  };

  this.obterComboProdutosAntecipacaoRealizada = (req, res) => anticipation
    .getProductsDropdownRealized()
    .then(arr => res.send(arr))
    .catch(error => res.catch(error));

  this.obterHoraLimite = (req, res) => anticipation.getHourLimit()
    .then(hora => res.send(hora))
    .catch(error => res.catch(error));

  return Promise.resolve(this);
};

module.exports = (di) => {
  di.provide('#antecipacao', '$main-db', '$siscof-wrapper', controller)
    .init('#antecipacao', '$server', (controller, server) => {
      server.post('/antecipacao/recebiveis', controller.obterRecebiveis);
      server.post('/antecipacao/realizadas', controller.obterRealizadas);
      server.post('/antecipacao/solicitar', controller.solicitarAntecipacao);
      server.get('/antecipacao/meses', controller.obterComboMeses);
      server.get('/antecipacao/produtos', controller.obterComboProdutos);
      server.get('/antecipacao/produtos-antecipacao-relaziada',
        controller.obterComboProdutosAntecipacaoRealizada);
      server.get('/antecipacao/hora-limite', controller.obterHoraLimite);
    });
};
