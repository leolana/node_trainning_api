const { DateTime } = require('luxon');
const tiposParticipante = require('../service/participante/type.enum');
const financialUsecases = require('../usecase/financeiro');

function controller(db, internalApis, siscofWrapper) {
  const usecases = financialUsecases(db, siscofWrapper);

  const _getInfoParticipante = id => db.entities.participante.findOne({
    attributes: ['documento', 'nome', 'razaoSocial', 'id'],
    where: { id },
  });

  const _getBandeiras = () => db.entities.bandeira
    .findAll({
      attributes: ['id', 'nome'],
      order: ['id'],
    })
    .then((data) => {
      const bandeiras = data.map(d => ({
        id: d.id,
        descricao: d.nome,
      }));
      return bandeiras;
    });

  const _getBandeiraDict = (bandeiras) => {
    const result = {};
    bandeiras.forEach((b) => {
      result[b.id] = b.descricao;
    });
    return result;
  };

  this.obterOpcoesBandeiras = (req, res) => {
    _getBandeiras()
      .then(data => res.send(data))
      .catch(error => res.catch(error));
  };

  this.obterOpcoesTipoOperacao = (req, res) => db.entities.evento
    .findAll({
      attributes: ['id', 'nome'],
      where: {
        id: [1, 2, 3, 4, 32, 33, 34, 101, 102, 112, 113, 114, 121, 122],
      },
      order: ['id'],
    })
    .then((data) => {
      const tipos = data.map(d => ({
        id: d.id,
        descricao: d.nome,
      }));
      res.send(tipos);
    })
    .catch(error => res.catch(error));

  this.obterTransacoesResumo = (req, res) => {
    // TODO: Quando o CNPJ estiver no contexto, utilizar
    // o do contexto e não dar mais um hit no banco.
    _getInfoParticipante(req.user.participante)
      .then((participante) => {
        if (!participante) throw String('estabelecimento-nao-encontrado');

        Promise.all([
          siscofWrapper.extratoResumido(req.user.participante),
          _getBandeiras(),
        ])
          .then((data) => {
            const consolidado = data[0].consolidados;
            const bandeiras = _getBandeiraDict(data[1]);
            consolidado.forEach((a) => {
              a.bandeira = bandeiras[a.bandeira];
            });

            res.send({
              razaoSocial: participante.razaoSocial,
              nomeFantasia: participante.nome,
              documento: participante.documento,
              id: participante.id,
              data: consolidado,
            });
          })
          .catch((error) => {
            if (error.statusCode === 404) {
              res.send({
                razaoSocial: participante.razaoSocial,
                nomeFantasia: participante.nome,
                documento: participante.documento,
                id: participante.id,
                data: [],
              });
            } else throw error;
          });
      })
      .catch(error => res.catch(error));
  };

  this.obterAnalitico = (req, res) => {
    // TODO: Quando o CNPJ estiver no contexto, utilizar
    // o do contexto e não dar mais um hit no banco.
    _getInfoParticipante(req.user.participante)
      .then((participante) => {
        if (!participante) throw String('participante-nao-encontrado');

        const filters = req.body != null
          ? {
            participante: req.user.participante,
            dataVendaInicial: DateTime.fromISO(
              req.body.dataVendaInicial
            ).startOf('day').toISODate(),
            dataVendaFinal: DateTime.fromISO(
              req.body.dataVendaFinal
            ).endOf('day').toISODate(),
            dataPagamentoInicial: DateTime.fromISO(
              req.body.dataPagamentoInicial
            ).startOf('day').toISODate(),
            dataPagamentoFinal: DateTime.fromISO(
              req.body.dataPagamentoFinal,
            ).endOf('day').toISODate(),
            idBandeira: req.body.idBandeira,
            statusTransacao: req.body.statusTransacao,
            statusPagamento: req.body.statusPagamento,
            tipoOperacao: req.body.tipoOperacao,
            posId: req.body.posId,
          }
          : {
            participante: req.user.participante,
          };
        Promise.all([
          siscofWrapper.extratoDetalhado(filters),
          _getBandeiras(),
        ])
          .then((data) => {
            const analitico = data[0].movimentos;
            const bandeiras = _getBandeiraDict(data[1]);
            analitico.forEach((a) => {
              a.bandeira = bandeiras[a.bandeira];
            });

            res.send({
              razaoSocial: participante.razaoSocial,
              nomeFantasia: participante.nome,
              documento: participante.documento,
              id: participante.id,
              data: analitico,
            });
          })
          .catch((error) => {
            if (error.statusCode === 404) {
              res.send({
                razaoSocial: participante.razaoSocial,
                nomeFantasia: participante.nome,
                documento: participante.documento,
                id: participante.id,
                data: [],
              });
            } else throw error;
          });
      })
      .catch(error => res.catch(error));
  };

  this.obterRelatorioConsolidadoFornecedor = (req, res) => {
    if (!req.query) {
      throw String('missing-req-query');
    }

    const diasPeriodo = req.query.period && +req.query.period;

    const promise = usecases
      .listConsolidatedDataForProvider(req.user.participante, diasPeriodo);

    return promise
      .then(data => res.send(data))
      .catch(error => res.catch(error));
  };

  return Promise.resolve(this);
}

module.exports = (di) => {
  di.provide(
    '#financeiro',
    '$main-db',
    '$internal-apis',
    '$siscof-wrapper',
    controller,
  ).init(
    '#financeiro',
    '$server',
    '$auth',
    (controller, server, auth) => {
      const require = auth.requireParticipante(
        tiposParticipante.estabelecimento,
        tiposParticipante.fornecedor,
      );

      server.get(
        '/financeiro/bandeiras',
        require,
        controller.obterOpcoesBandeiras,
      );
      server.get(
        '/financeiro/tipos-operacao',
        require,
        controller.obterOpcoesTipoOperacao,
      );
      server.get(
        '/financeiro/resumo',
        require,
        controller.obterTransacoesResumo,
      );
      server.post('/financeiro/analitico', require, controller.obterAnalitico);

      server.get(
        '/financeiro/relatorio-consolidado-fornecedor',
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.obterRelatorioConsolidadoFornecedor
      );
    },
  );
};
