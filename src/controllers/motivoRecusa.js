/* eslint-disable max-len */
const listEcRejectReasons = require('../usecase/motivoRecusa/listEcRejectReasons.usecase');
const listSupplierRejectReasons = require('../usecase/motivoRecusa/listSupplierRejectReasons.usecase');
const listLinkRejectReasons = require('../usecase/motivoRecusa/listLinkRejectReasons.usecase');
/* eslint-enable max-len */

const tiposParticipante = require('../service/participante/type.enum');

const controller = (db) => {
  this.obterMotivosRecusaIndicacaoEc = (req, res) => (
    listEcRejectReasons(db)()
      .then(data => res.send(data))
      .catch(error => res.catch(error))
  );

  this.obterMotivosRecusaIndicacaoFornecedor = (req, res) => (
    listSupplierRejectReasons(db)()
      .then(data => res.send(data))
      .catch(error => res.catch(error))
  );

  this.obterMotivosRecusaVinculo = (req, res) => (
    listLinkRejectReasons(db)()
      .then(data => res.send(data))
      .catch(error => res.catch(error))
  );

  return Promise.resolve(this);
};

const endpoints = (
  controller,
  server,
  auth,
  roles
) => {
  const requireBackoffice = auth.require(
    roles.boAdministrador, roles.boOperacoes
  );

  const requireParticipante = auth.requireParticipante(
    tiposParticipante.estabelecimento,
    tiposParticipante.fornecedor
  );

  server.get(
    '/motivo-recusa/indicacao/ec',
    requireBackoffice,
    controller.obterMotivosRecusaIndicacaoEc
  );

  server.get(
    '/motivo-recusa/indicacao/fornecedor',
    requireBackoffice,
    controller.obterMotivosRecusaIndicacaoFornecedor
  );

  server.get(
    '/motivo-recusa/vinculo',
    requireParticipante,
    controller.obterMotivosRecusaVinculo
  );
};

module.exports = di => di
  .provide('#motivos', '$main-db', controller)
  .init('#motivos', '$server', '$auth', '@@roles', endpoints);
