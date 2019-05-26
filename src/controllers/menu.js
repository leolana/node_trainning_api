const credStats = require('../service/credenciamento/accreditationStatus.enum');
// eslint-disable-next-line max-len
const indicacaoStatus = require('../service/participante/nominationStatus.enum');
const vinculoStatus = require('../service/vinculo/status.enum');
const cessaoStatus = require('../service/cessao/status.enum');
const canalEntrada = require('../service/participante/nominationSource.enum');
const roles = require('../service/auth/roles.enum');

function controller(db, authSettings) {
  const rolesBko = [
    roles.boAdministrador,
    roles.boOperacoes,
    roles.super,
  ];

  this.get = (req, res) => {
    const promises = [];
    const add = promise => promises.push(promise);

    const menu = {
      bulletCredenciamentoPendente: 0,
      bulletFornecedorPendenteCadastro: 0,
      bulletVinculosPendentes: 0,
      bulletCessoesPendentes: 0,
    };

    const { user } = req;
    const ehEstabelecimento = user.participanteEstabelecimento;
    const ehFornecedor = user.participanteFornecedor;
    const ehBackoffice = user.resource_access[authSettings.clientId].roles.some(
      r => rolesBko.includes(r)
    );

    if (ehBackoffice) {
      add(
        db.entities.credenciamento.count({
          where: { status: credStats.pendente, ativo: true },
        }).then((amount) => {
          menu.bulletCredenciamentoPendente = amount;
        })
      );

      add(
        db.entities.participanteIndicacao.count({
          where: {
            canalEntrada: canalEntrada.indicacaoPorFornecedor,
            status: indicacaoStatus.pendente,
          },
        }).then((amount) => {
          menu.bulletEcPendenteCadastro = amount;
        })
      );

      add(
        db.entities.participanteIndicacao.count({
          where: {
            canalEntrada: canalEntrada.indicacaoPorEc,
            status: indicacaoStatus.pendente,
          },
        }).then((amount) => {
          menu.bulletFornecedorPendenteCadastro = amount;
        })
      );
    }

    if (ehEstabelecimento) {
      add(
        db.entities.participanteVinculo.count({
          where: {
            participanteEstabelecimentoId: +user.participante,
            status: vinculoStatus.pendente,
          },
        }).then((amount) => {
          menu.bulletVinculosPendentes = amount;
        })
      );
    }

    if (ehEstabelecimento || ehFornecedor) {
      add(
        db.entities.participanteVinculo.findAll({
          attributes: ['id'],
          where: {
            $or: [
              { participanteEstabelecimentoId: +user.participante },
              { participanteFornecedorId: +user.participante },
            ],
          },
          include: [{
            model: db.entities.cessao,
            as: 'cessoes',
            require: true,
            attributes: ['id'],
            where: {
              status: cessaoStatus.aguardandoAprovacao,
              dataExpiracao: { $gt: new Date() },
            },
          }],
        }).then((vinculos) => {
          menu.bulletCessoesPendentes = vinculos
            .reduce((amount, vinculo) => amount + vinculo.cessoes.length, 0);
        })
      );
    }

    return Promise.all(promises)
      .then(() => res.send(menu))
      .catch(e => res.catch(e));
  };

  return Promise.resolve(this);
}

function endPoints(controller, server) {
  server.get('/menu', controller.get);
}

module.exports = di => di
  .provide('#menu', '$main-db', '@auth-settings', controller)
  .init('#menu', '$server', endPoints);
