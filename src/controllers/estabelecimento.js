const tiposParticipante = require('../service/participante/type.enum');
const obterDocumentoIndicacaoFornecedor = require(
  '../usecase/estabelecimento/checkProviderIndication.usecase'
);

function controller(db) {
  this.checkDocumentIndicationProvider = (req, res) => {
    const { documento } = req.params;
    const estabelecimentoId = +req.user.participante;

    return obterDocumentoIndicacaoFornecedor(db)(estabelecimentoId, documento)
      .then(obj => res.send(obj))
      .catch(e => res.catch(e));
  };

  return Promise.resolve(this);
}

function endPoints(controller, server, auth) {
  server.get(
    '/estabelecimento/checa-documento-indicacao-fornecedor/:documento',
    auth.requireParticipante(tiposParticipante.estabelecimento),
    controller.checkDocumentIndicationProvider
  );
}

module.exports = di => di
  .provide('#estabelecimento', '$main-db', controller)
  .init('#estabelecimento', '$server', '$auth', endPoints);
