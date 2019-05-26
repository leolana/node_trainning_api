const feeUsecases = require('../usecase/taxas');

const controller = db => {
  const usecases = feeUsecases(db);

  this.commercialConditions = (req, res) => {
    const ramoAtividade = +req.query.ramoAtividade;
    const tipoPessoa = +req.query.tipoPessoa;
    const faturamentoCartao = +req.query.faturamentoCartao;

    return usecases
      .commercialConditions(ramoAtividade, tipoPessoa, faturamentoCartao)
      .then(taxa => res.send(taxa))
      .catch(error => res.catch(error));
  };

  this.getTaxas = (req, res) => {
    const idTipoPessoa = +req.query.idTipoPessoa;
    const idRamoAtividade = +req.query.idRamoAtividade;
    const temInicio = req.query.inicioVigencia;
    const inicioVigencia = temInicio ? new Date(temInicio) : null;
    const temFim = req.query.terminoVigencia;
    const terminoVigencia = temFim ? new Date(temFim) : null;

    return usecases
      .listFees(idTipoPessoa, idRamoAtividade, inicioVigencia, terminoVigencia)
      .then(taxas => res.send(taxas))
      .catch(error => res.catch(error));
  };

  this.getTaxa = (req, res) => {
    const idTaxa = +req.query.id;
    const tipoPessoa = +req.query.idTipoPessoa || null;
    const idRamoAtividade = +req.query.idRamoAtividade || null;
    const inicio = new Date(req.query.inicioVigencia);
    const temFim = req.query.terminoVigencia;
    const fim = temFim ? new Date(temFim) : null;
    const ignoreerror = Boolean(req.query.ignoreerror);

    return usecases
      .findFee(idTaxa, tipoPessoa, idRamoAtividade, inicio, fim, ignoreerror)
      .then(taxa => res.send(taxa))
      .catch(e => res.catch(e));
  };

  this.getTaxaPrazos = (req, res) => {
    const action = usecases
      .listFeeTerms()
      .then(terms => res.send(terms))
      .catch(error => res.catch(error));

    return action;
  };

  this.getTaxaRanges = (req, res) => {
    const action = usecases
      .listFeeTermRanges()
      .then(ranges => res.send(ranges))
      .catch(error => res.catch(error));

    return action;
  };

  this.addTaxa = (req, res) => {
    const json = req.body;
    const usuario = req.user.email;

    return usecases
      .addFee(json, usuario)
      .then(taxa => res.send(taxa))
      .catch(error => res.catch(error));
  };

  this.updateTaxa = (req, res) => {
    const json = req.body;
    const usuario = req.user.email;

    return usecases
      .updateFee(json, usuario)
      .then(taxa => res.send(taxa))
      .catch(error => res.catch(error));
  };

  return Promise.resolve(this);
};

module.exports = di => {
  di.provide('#taxas', '$main-db', controller).init(
    '#taxas',
    '$server',
    (controller, server) => {
      server.get('/dominio/taxas', controller.commercialConditions);
      server.get('/taxas', controller.getTaxas);
      server.get('/taxa', controller.getTaxa);
      server.get('/taxa/prazos', controller.getTaxaPrazos);
      server.get('/taxa/ranges', controller.getTaxaRanges);
      server.post('/taxa/edit', controller.updateTaxa);
      server.post('/taxa/add', controller.addTaxa);
    },
  );
};
