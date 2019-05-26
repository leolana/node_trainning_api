const installmentOptions = require('../service/cessao/installmentOptions.util');
const newInstallment = require('../usecase/cessao/newInstallment.usecase');
const findTermByType = require('../service/termo/findCurrentByType.util');
const cessaoStatus = require('../service/cessao/status.enum');
const termoTipo = require('../service/termo/type.enum');
const cessaoTipo = require('../service/cessao/type.enum');
const vinculoStatus = require('../service/vinculo/status.enum');
const tiposParticipante = require('../service/participante/type.enum');

function controller(
  db,
  siscofWrapper,
  cessaoService,
  mailer,
  emailTemplates,
  mailerConfig,
) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const participanteTypes = {
    fornecedor: 'fornecedor',
    estabelecimento: 'estabelecimento',
  };

  const eventosDoTipoAjuste = {
    123: '.',
    133: '.',
  };

  const getEntity = (req) => {
    const isFornecedor = req.user.participanteFornecedor;
    const fromParticipanteType = isFornecedor
      ? db.entities.participanteFornecedor
      : db.entities.participanteEstabelecimento;

    return {
      dbSet: fromParticipanteType,
      type: isFornecedor
        ? participanteTypes.fornecedor
        : participanteTypes.estabelecimento,
    };
  };

  const referenceParticipanteType = type => ({
    model:
      type === participanteTypes.fornecedor
        ? db.entities.participanteEstabelecimento
        : db.entities.participanteFornecedor,
    as:
      type === participanteTypes.fornecedor ? 'estabelecimento' : 'fornecedor',
    include: [
      {
        model: db.entities.participante,
        as: 'participante',
        attributes: ['nome', 'documento'],
      },
    ],
  });

  const checaCessaoExpirada = (cessao) => {
    if (cessao.status === cessaoStatus.aguardandoAprovacao) {
      const passouExpiracao = new Date(cessao.dataExpiracao) < today;
      const passouVencimento = new Date(cessao.dataVencimento) < today;

      if (passouExpiracao || passouVencimento) {
        cessao.status = cessaoStatus.expirada;
      }
    }

    return cessao.status === cessaoStatus.expirada;
  };

  const listarCessoesDetalhe = (cessao, vinculo) => {
    const action = siscofWrapper
      .listarCessoesDetalhe(cessao, vinculo)
      .then((resultSiscof) => {
        resultSiscof.recebiveis.forEach((recebivel) => {
          recebivel.cessaoId = cessao.id;
        });
        db.entities.cessaoRecebivel
          .destroy({
            where: { cessaoId: cessao.id },
          })
          .then(() => {
            db.entities.cessaoRecebivel.bulkCreate(resultSiscof.recebiveis);
            db.entities.cessaoRecebivelHistorico.bulkCreate(
              resultSiscof.recebiveis,
            );
          });
        return resultSiscof;
      });
    return action;
  };

  const aprovarCessao = (aprovado) => {
    const action = (req, res) => {
      const participanteId = +req.user.participante;
      const cessaoId = +req.body.id;

      // Sempre buscar o termo vigente na aprovação
      return findTermByType(db)(termoTipo.aditivo)
        .then((termo) => {
          const promise = cessaoService.aprovarReprovarCessao(
            aprovado,
            participanteId,
            cessaoId,
            termo.id,
            req.user.email,
          );
          return promise;
        })
        .then(() => res.end())
        .catch(error => res.catch(error));
    };
    return action;
  };

  this.obterCessoes = (req, res) => {
    const id = +req.user.participante;
    const entity = getEntity(req);

    function getParticipante() {
      return entity.dbSet.findOne({
        where: { participanteId: id },
        include: [
          {
            model: db.entities.participanteVinculo,
            as: 'vinculos',
            attribues: ['id'],
            include: [
              referenceParticipanteType(entity.type),
              {
                model: db.entities.cessao,
                as: 'cessoes',
                attributes: [
                  'id',
                  'status',
                  'valorSolicitado',
                  'createdAt',
                  'dataExpiracao',
                  'dataVencimento',
                  'referencia',
                  'dataRespostaEstabelecimento',
                  'codigoCessao',
                  'tipo',
                  'diluicaoPagamento',
                ],
              },
            ],
          },
        ],
      });
    }

    return getParticipante()
      .then((queryResult) => {
        if (!queryResult || !queryResult.vinculos) {
          res.send({});
          return;
        }

        function map(cessao, vinculo) {
          const person = (vinculo.fornecedor || vinculo.estabelecimento)
            .participante;

          return {
            codigo: cessao.id,
            valorSolicitado: cessao.valorSolicitado,
            nome: person.nome,
            documento: person.documento,
            data: cessao.createdAt,
            dataExpiracao: cessao.dataExpiracao,
            dataVencimento: cessao.dataVencimento,
            dataResposta: cessao.dataRespostaEstabelecimento,
            referencia: cessao.referencia,
            codigoCessao: cessao.codigoCessao,
            tipoCessao: cessao.tipo,
            tipoDiluicaoPagamento: cessao.diluicaoPagamento,
          };
        }

        const obj = {};
        queryResult.vinculos.forEach((vinculo) => {
          vinculo.cessoes.forEach((cessao) => {
            checaCessaoExpirada(cessao);

            if (!obj[cessao.status]) {
              obj[cessao.status] = [];
            }

            const _cessao = map(cessao, vinculo);
            obj[cessao.status].push(_cessao);
          });
        });

        res.send(obj);
      })
      .catch(error => res.catch(error));
  };

  this.obterCessao = (req, res) => {
    const participanteId = +req.user.participante;
    const cessaoId = +req.params.id;
    const entity = getEntity(req);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const collection = {};

    const listEventos = () => {
      const action = db.entities.evento
        .findAll({
          attributes: ['id', 'nome'],
        })
        .then((arr) => {
          collection.eventos = arr;
        });

      return action;
    };

    const listBandeiras = () => {
      const action = db.entities.bandeira
        .findAll({
          where: {
            ativo: true,
          },
          attributes: ['id', 'nome'],
        })
        .then((arr) => {
          collection.bandeiras = arr;
        });

      return action;
    };

    const get = () => {
      const action = entity.dbSet
        .findOne({
          where: { participanteId },
          include: [
            {
              model: db.entities.participanteVinculo,
              as: 'vinculos',
              include: [
                {
                  model: db.entities.cessao,
                  as: 'cessoes',
                  where: { id: cessaoId },
                  attributes: [
                    'id',
                    'valorSolicitado',
                    'valorDisponivel',
                    'dataExpiracao',
                    'status',
                    'tipo',
                    'diluicaoPagamento',
                    'dataVencimento',
                    ['createdAt', 'dataSolicitacao'],
                    'solicitante',
                    ['dataRespostaEstabelecimento', 'dataReposta'],
                    ['usuarioRespostaEstabelecimento', 'responsavelRespota'],
                    'codigoCessao',
                    'referencia',
                    'numeroParcelas',
                  ],
                },
                {
                  model: db.entities.participanteVinculoRecorrente,
                  as: 'recorrentes',
                  attributes: ['valorMaximo', 'dataFinalVigencia'],
                  where: {
                    status: [vinculoStatus.pendente, vinculoStatus.aprovado],
                    dataFinalVigencia: {
                      $gte: today,
                    },
                  },
                  required: false,
                },
                referenceParticipanteType(participanteTypes.estabelecimento),
                referenceParticipanteType(participanteTypes.fornecedor),
              ],
            },
          ],
        })
        .then((participante) => {
          if (!participante) {
            throw String('participante-nao-encontrado');
          }
          if (!participante.vinculos.length) {
            throw String('vinculo-nao-encontrado');
          }
          if (!participante.vinculos[0].cessoes.length) {
            throw String('cessao-nao-encontrada');
          }

          const vinculo = participante.vinculos[0];
          const cessao = vinculo.cessoes[0].dataValues;

          if (cessao.tipo === cessaoTipo.recorrenteAprovacaoAutomatica) {
            if (!vinculo.recorrentes.length) {
              throw String('vinculo-cessao-recorrente-nao-encontrado');
            }
            const recorrencia = vinculo.recorrentes[0].dataValues;
            cessao.recorrencia = {
              valorMaximoRecorrente: recorrencia.valorMaximo,
              dataExpiracaoRecorrente: recorrencia.dataFinalVigencia,
            };
          }

          if (checaCessaoExpirada(cessao)) {
            cessao.status = cessaoStatus.expirada;
          }

          return listarCessoesDetalhe(cessao, vinculo).then((siscofResult) => {
            const { recebiveis } = siscofResult;
            if (!recebiveis) {
              throw String('sem-recebiveis');
            }

            Object.assign(cessao, {
              tipoCessao: cessao.tipo,
              tipoDiluicaoPagamento: cessao.diluicaoPagamento,
              fornecedor: vinculo.fornecedor.participante.dataValues,
              estabelecimento: vinculo.estabelecimento.participante.dataValues,
            });

            // group
            const parcelas = {};

            recebiveis.forEach((r) => {
              const parcela = parcelas[r.numeroParcelaCessao]
                || (parcelas[r.numeroParcelaCessao] = {
                  itens: {},
                  ajustes: {},
                  numeroParcelaCessao: r.numeroParcelaCessao,
                });

              const categoria = (r.eventoId in eventosDoTipoAjuste)
                ? parcela.ajustes
                : parcela.itens;

              const diaPagamento = categoria[r.dataPagarEc]
                || (categoria[r.dataPagarEc] = []);

              Object.assign(r, {
                bandeiraId: r.bandeira,
                bandeira: collection.bandeiras.find(i => i.id === +r.bandeira),
                evento: collection.eventos.find(i => i.id === +r.eventoId),
              });

              diaPagamento.push(r);
            });

            // map and sort
            cessao.parcelas = Object
              .values(parcelas)
              .sort((x, y) => x.numeroParcelaCessao - y.numeroParcelaCessao);
            const mapRecebiveis = (parcela, categoria) => {
              parcela[categoria] = Object
                .keys(parcela[categoria])
                .map((date) => {
                  const data = new Date(date).toISOString();
                  const objData = {
                    data,
                    recebiveis: parcela[categoria][date],
                    total: parcela[categoria][date]
                      .reduce((acc, x) => acc + x.valorPagarEc, 0),
                  };
                  parcela.total += objData.total;
                  return objData;
                });
            };

            cessao.parcelas.forEach((parcela) => {
              parcela.total = 0;

              mapRecebiveis(parcela, 'itens');
              mapRecebiveis(parcela, 'ajustes');
            });
            cessao.totalRecebiveis = cessao.parcelas
              .reduce((acc, parcela) => acc + parcela.total, 0);

            return Promise.resolve(cessao);
          });
        })
        .then(result => res.send(result))
        .catch(error => res.catch(error));

      return action;
    };

    return Promise.all([listEventos(), listBandeiras()]).then(get);
  };

  this.obterDisponibilidadeRecorrentes = (req, res) => {
    // TODO: Rever autorização
    const action = cessaoService
      .verificaRecorrenciaPorIdVinculo(+req.params.vinculoId)
      .then(retorno => res.send(retorno))
      .catch(error => res.catch(error));

    return action;
  };

  this.aprovarCessao = aprovarCessao(true);

  this.reprovarCessao = aprovarCessao(false);

  this.alterarCessao = (req, res) => {
    const cessaoId = +req.body.id;
    const participanteId = req.user.participante;

    function get() {
      return db.entities.participanteVinculo.findOne({
        attributes: ['id'],
        where: {
          $or: {
            participanteEstabelecimentoId: participanteId,
            participanteFornecedorId: participanteId,
          },
        },
        include: [
          {
            model: db.entities.cessao,
            as: 'cessoes',
            where: {
              id: cessaoId,
            },
            required: true,
          },
        ],
      });
    }

    function update(vinculo) {
      if (!vinculo || vinculo.cessoes.length === 0) {
        throw String('cessao-nao-encontrada');
      }

      const cessao = vinculo.cessoes[0];
      const now = new Date();

      const dataExpiracao = new Date(req.body.dataExpiracao);
      const dataMinExpiracao = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
      );

      if (dataExpiracao < dataMinExpiracao) {
        throw String('data-expiracao-anterior-prox-dia');
      }

      if (dataExpiracao > new Date(cessao.dataVencimento)) {
        throw String('data-expiracao-posterior-vencimento');
      }

      cessao.dataExpiracao = req.body.dataExpiracao;
      cessao.referencia = req.body.referencia;
      cessao.usuario = req.user.email;

      return cessao.save();
    }

    return get()
      .then(update)
      .then(() => res.end())
      .catch(error => res.catch(error));
  };

  this.buscarOpcoesParcelamento = (req, res) => {
    const vinculoId = +req.params.vinculoId;
    const valorSolicitado = +req.query.valor;
    const dataVencimento = new Date(req.query.dataVencimento);

    const getVinculo = () => {
      const action = db.entities.participanteVinculo.findOne({
        where: { id: vinculoId },
        attribues: [
          'participanteEstabelecimentoId',
          'participanteFornecedorId',
        ],
      });
      return action;
    };

    const getOptions = (vinculo) => {
      const action = installmentOptions(siscofWrapper)(
        vinculo.participanteFornecedorId,
        vinculo.participanteEstabelecimentoId,
        dataVencimento,
        valorSolicitado,
      );
      return action;
    };

    return getVinculo()
      .then(vinculo => getOptions(vinculo))
      .then(options => res.send(options))
      .catch(error => res.catch(error));
  };

  this.solicitarCessaoParcelada = (req, res) => {
    const vinculoId = +req.params.vinculoId;
    const diluicao = +req.body.pagamento;
    const valorCessao = +req.body.valorCessao;
    const dataVencimento = new Date(req.body.dataVencimento);
    const dataExpiracao = new Date(req.body.dataExpiracao);
    const referencia = String(req.body.referencia);
    const numParcelasEscolhido = +req.body.parcelamento;
    const userId = +req.user.participante;
    const userEmail = String(req.user.email);
    const userName = String(req.user.name);

    const action = newInstallment(
      db,
      siscofWrapper,
      mailer,
      emailTemplates,
      mailerConfig,
    )(
      vinculoId,
      diluicao,
      valorCessao,
      dataVencimento,
      dataExpiracao,
      referencia,
      numParcelasEscolhido,
      userId,
      userEmail,
      userName,
    );

    return action
      .then(cession => res.send(cession))
      .catch(error => res.catch(error));
  };

  return Promise.resolve(this);
}

module.exports = (di) => {
  di.provide(
    '#cessoes',
    '$main-db',
    '$siscof-wrapper',
    '$cessao-service',
    '$mailer',
    '@@email-templates',
    '@mailer-settings',
    controller,
  ).init(
    '#cessoes',
    '$server',
    '$auth',
    '@@roles',
    (controller, server, auth, roles) => {
      const requireFornecedor = auth.require(
        roles.boAdministrador,
        roles.boOperacoes,
        roles.fcAdministrador,
        roles.fcFinanceiro,
        roles.fcComercial,
      );
      const requireEstabelecimento = auth.require(
        roles.boAdministrador,
        roles.boOperacoes,
        roles.ecAdministrador,
        roles.ecFinanceiro,
        roles.ecCompras,
      );

      server.get(
        '/fornecedor/cessoes',
        requireFornecedor,
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.obterCessoes,
      );
      server.get(
        '/fornecedor/cessao/:id',
        requireFornecedor,
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.obterCessao,
      );
      server.get(
        '/fornecedor/:vinculoId/recorrente',
        requireFornecedor,
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.obterDisponibilidadeRecorrentes,
      );
      server.get(
        '/estabelecimento/cessoes',
        requireEstabelecimento,
        auth.requireParticipante(tiposParticipante.estabelecimento),
        controller.obterCessoes,
      );
      server.get(
        '/estabelecimento/:estabelecimentoId/cessao/:id',
        requireEstabelecimento,
        auth.requireParticipante(tiposParticipante.estabelecimento),
        controller.obterCessao,
      );
      server.post(
        '/estabelecimento/:estabelecimentoId/cessao/:id/alterar',
        requireFornecedor,
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.alterarCessao,
      );
      server.post(
        '/estabelecimento/:estabelecimentoId/cessao/:id/aprovar',
        requireEstabelecimento,
        auth.requireParticipante(tiposParticipante.estabelecimento),
        controller.aprovarCessao,
      );
      server.post(
        '/estabelecimento/:estabelecimentoId/cessao/:id/reprovar',
        requireEstabelecimento,
        auth.requireParticipante(tiposParticipante.estabelecimento),
        controller.reprovarCessao,
      );

      server.get(
        '/fornecedor/:vinculoId/opcoesParcelamento',
        requireFornecedor,
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.buscarOpcoesParcelamento,
      );
      server.post(
        '/fornecedor/:vinculoId/cessaoParcelada',
        requireFornecedor,
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.solicitarCessaoParcelada,
      );

      // APIs para compatibilidade com o Gateway
      // TODO: Rever forma de consumir essas APIs
      server.get(
        '/fornecedor/:fornecedorId/cessoes',
        requireFornecedor,
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.obterCessoes,
      );
      server.get(
        '/fornecedor/:fornecedorId/cessao/:id',
        requireFornecedor,
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.obterCessao,
      );
    },
  );
};
