const findCurrentByType = require('../service/termo/findCurrentByType.util');
const accept = require('../service/termo/accept.util');

function controller(db) {
  this.obterTermoVigentePorTipo = (req, res) => {
    const tipo = +req.params.tipo;

    return findCurrentByType(db)(tipo)
      .then(termo => {
        res.send(termo || {});
      })
      .catch(error => res.catch(error));
  };

  this.aceitarTermo = (req, res) => {
    const id = +req.params.id;
    const participanteId = +req.user.participante;
    const user = req.user.email;

    return accept(db)(id, participanteId, user)
      .then(() => res.end())
      .catch(error => res.catch(error));
  };

  return Promise.resolve(this);
}

module.exports = di => {
  di.provide('#termo', '$main-db', controller).init(
    '#termo',
    '$server',
    (controller, server) => {
      server.get('/dominio/termo/:tipo', controller.obterTermoVigentePorTipo);
      server.post('/dominio/termo/:id/aceitar', controller.aceitarTermo);
    },
  );
};
