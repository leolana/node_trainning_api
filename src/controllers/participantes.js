const tiposParticipante = require('../service/participante/type.enum');
const fileService = require('../service/participante/fetchFile.service');
const getProviderLinks = require('../usecase/vinculo/getProviderLinks.usecase');
const getProviderNominations = require(
  '../usecase/vinculo/getProviderNominations.usecase'
);
const getProviderRequestedLinks = require(
  '../usecase/vinculo/getProviderRequestedLinks.usecase'
);
const indicacaoStatus = require(
  '../service/participante/nominationStatus.enum'
);
const vinculoStatus = require(
  '../service/vinculo/status.enum'
);
const tiposPessoa = require('../service/participante/personType.enum');
const nomination = require('../service/participante/nominationSource.enum');
const _formatarDocumento = require(
  '../service/participante/formatDocumento.service'
);
const indicacoesEcService = require(
  '../usecase/participante/searchEcNomination.usecase'
);
const reprovarIndicacaoService = require(
  '../usecase/participante/rejectNomination.usecase'
);

const tipoTaxa = require('../service/participante/rateType.enum');
const useCaseParticipante = require('../usecase/participante/index');

function Controller(
  db,
  vinculoService,
  siscofWrapper,
  mailer,
  emailTemplates,
  mailerSettings,
  fileStorage
) {
  const fetchFile = fileService(db, fileStorage);
  const useCasesParticipante = useCaseParticipante(db);
  const indicacoesEc = indicacoesEcService(db);
  const reprovarIndicacao = reprovarIndicacaoService(db);

  this.pesquisarParticipantes = (req, res) => {
    let where = {};

    if (req.query.term) {
      where = db.where(
        db.fn('unaccent', db.col('nome')),
        { $iLike: db.fn('unaccent', `%${req.query.term}%`) }
      );
    }

    db.entities.participante
      .findAll({
        where,
        attributes: ['id', 'nome'],
        order: [['nome', 'ASC']],
      })
      .then(participantes => participantes.map(c => ({
        id: c.id,
        text: `${c.nome}`,
      })))
      .then(participantes => res.send(participantes))
      .catch(error => res.catch(error));
  };

  function obterParticipante(identityName) {
    return (req, res) => {
      db.entities[identityName]
        .findAll({
          attributes: ['participanteId'],
          include: [{
            model: db.entities.participante,
            attributes: ['id', 'documento', 'nome'],
          }],
        })
        .then(found => res.send(
          found.map(t => ({ ...t.participante.dataValues }))
        ))
        .catch(error => res.catch(error));
    };
  }
  this.obterFornecedores = obterParticipante('participanteFornecedor');
  this.obterEstabelecimentos = obterParticipante('participanteEstabelecimento');

  function procurarParticipante(identityName) {
    return (req, res) => {
      const participanteId = +req.user.participante;
      const { documento } = req.params;

      db.entities[identityName]
        .findOne({
          attributes: ['participanteId'],
          include: [{
            model: db.entities.participante,
            attributes: ['id', 'documento', 'nome'],
            where: {
              documento,
              ativo: true,
            },
          }],
        })
        .then((found) => {
          if (found) {
            return res.send(found.participante);
          }

          const indicacoes = db.entities.indicacaoFornecedorFalha;
          const indicacao = {
            participanteId,
            documento,
            usuario: req.user.email,
          };

          return indicacoes.findOne({ where: indicacao }).then((jaIndicado) => {
            if (jaIndicado) res.send({});
            else indicacoes.create(indicacao).then(() => res.send({}));
          });
        })
        .catch(error => res.catch(error));
    };
  }
  this.procurarFornecedor = procurarParticipante(
    'participanteFornecedor'
  );
  this.procurarEstabelecimento = procurarParticipante(
    'participanteEstabelecimento'
  );

  this.indicarFornecedor = (req, res) => {
    const estabelecimentoComercialId = +req.user.participante;
    const {
      documento,
      nome,
      email,
      telefone,
    } = req.body;
    const tipoPessoa = tiposPessoa.verifyPersonType(documento);
    const canalEntrada = req.user.participanteFornecedor
      ? nomination.indicacaoPorFornecedor
      : nomination.indicacaoPorEc;
    const statusPendente = vinculoStatus.pendente;

    db.entities.participante
      .findAll({
        where: {
          id: estabelecimentoComercialId,
          ativo: true,
        },
        attributes: ['id', 'nome', 'razaoSocial'],
        include: [{
          model: db.entities.participanteIndicacao,
          as: 'indicacoes',
          attributes: ['id', 'documento'],
        }],
      }).then((participantes) => {
        const estabelecimentoComercial = participantes.find(
          i => i.id === estabelecimentoComercialId
        );

        if (!estabelecimentoComercial) {
          throw String('estabelecimento-nao-encontrado');
        }

        if (estabelecimentoComercial.indicacoes.some(
          i => i.documento === documento
        )) {
          throw String('fornecedor-ja-indicado');
        }

        return db.entities.participanteIndicacao.create({
          participanteId: estabelecimentoComercialId,
          documento,
          nome,
          email,
          telefone,
          usuario: req.user.email,
          tipoPessoa,
          canalEntrada,
          statusPendente,
        }).then(() => {
          mailer.enviar({
            templateName: emailTemplates.INDICACAO_FORNECEDOR_NAO_CADASTRADO,
            destinatary: req.user.email,
            substitutions: {
              estabelecimento: estabelecimentoComercial.razaoSocial
                || estabelecimentoComercial.nome,
              fornecedor: _formatarDocumento(documento),
              linkCessao: `${mailerSettings.baseUrl}/cessoes`,
            },
          });
        });
      })
      .then(() => res.end())
      .catch(error => res.catch(error));
  };


  function vincular(solicitadoEstabelecimento) {
    return (req, res) => {
      const estabelecimentoComercialId = solicitadoEstabelecimento
        ? +req.user.participante
        : +req.body.estabelecimentoComercialId;
      const fornecedorId = !solicitadoEstabelecimento
        ? +req.user.participante
        : +req.body.fornecedorId;

      if (estabelecimentoComercialId === fornecedorId) {
        res.catch('vinculo-mesmo-participante-invalido');
        return;
      }

      const contatoInclude = () => ({
        model: db.entities.participanteContato,
        as: 'contatos',
        attributes: ['participanteId', 'email'],
        where: { ativo: true },
      });

      const participanteInclude = () => ({
        model: db.entities.participante,
        as: 'participante',
        attributes: ['id', 'nome', 'documento'],
        include: [contatoInclude()],
        where: { ativo: true },
      });

      const vinculoInclude = () => ({
        model: db.entities.participanteVinculo,
        as: 'vinculos',
        attributes: [
          'id',
          'participanteEstabelecimentoId',
          'participanteFornecedorId',
        ],
      });

      const createParticipanteVinculo = (
        estabelecimentoComercialId,
        fornecedorId,
        solicitadoEstabelecimento,
        statusVinculo
      ) => db.entities.participanteVinculo.create({
        participanteEstabelecimentoId: estabelecimentoComercialId,
        participanteFornecedorId: fornecedorId,
        usuario: req.user.email,
        exibeValorDisponivel: true,
        diasAprovacao: 2,
        estabelecimentoSolicitouVinculo: solicitadoEstabelecimento,
        status: statusVinculo,
        dataRespostaEstabelecimento: new Date(),
        usuarioRespostaEstabelecimento: req.user.email,
      });

      Promise.all([
        db.entities.participanteFornecedor.findOne({
          where: { participanteId: fornecedorId },
          attributes: ['participanteId'],
          include: [participanteInclude(), vinculoInclude()],
        }),
        db.entities.participanteEstabelecimento.findOne({
          where: { participanteId: estabelecimentoComercialId },
          attributes: ['participanteId'],
          include: [participanteInclude(), vinculoInclude()],
        })])
        .then((results) => {
          const fornecedor = results[0];
          const estabelecimento = results[1];

          if (!estabelecimento) {
            throw String('estabelecimento-nao-encontrado');
          }

          if (!fornecedor) {
            throw String('fornecedor-nao-encontrado');
          }

          if (solicitadoEstabelecimento && estabelecimento.vinculos.some(
            f => f.participanteFornecedorId === fornecedorId
          )) {
            throw String('fornecedor-ja-vinculado');
          }

          if (!solicitadoEstabelecimento && fornecedor.vinculos.some(
            f => f.participanteEstabelecimentoId === estabelecimentoComercialId
          )) {
            throw String('estabelecimento-ja-vinculado');
          }

          if (solicitadoEstabelecimento) {
            return siscofWrapper.incluirExcluirCessionarioEC(
              fornecedorId,
              estabelecimentoComercialId,
              vinculoStatus.aprovado
            )
              .then(() => {
                createParticipanteVinculo(
                  estabelecimentoComercialId,
                  fornecedorId,
                  solicitadoEstabelecimento,
                  vinculoStatus.aprovado
                ).then(() => Promise.all([
                  /* eslint-disable max-len */
                  mailer.enviar({
                    templateName: emailTemplates.INDICACAO_FORNECEDOR_CADASTRADO,
                    destinatary: fornecedor.participante.contatos[0].email,
                    substitutions: {
                      estabelecimento: estabelecimento.participante.nome,
                      linkSolicitarCessao: `${mailerSettings.baseUrl}/fornecedor/estabelecimentos`,
                    },
                  }),
                  mailer.enviar({
                    templateName: emailTemplates.INDICACAO_FORNECEDOR_CADASTRADO_ESTABELECIMENTO,
                    destinatary: req.user.email,
                    substitutions: {
                      fornecedor: fornecedor.participante.nome,
                      linkSolicitarCessaoPendentes: `${mailerSettings.baseUrl}/estabelecimento/fornecedores`,
                    },
                  }),
                  /* eslint-enable max-len */
                ]));
              });
          }

          return createParticipanteVinculo(
            estabelecimentoComercialId,
            fornecedorId,
            solicitadoEstabelecimento,
            vinculoStatus.pendente
          ).then(() => Promise.all([
            /* eslint-disable max-len */
            mailer.enviar({
              templateName: emailTemplates.INDICACAO_ESTABELECIMENTO_CADASTRADO,
              destinatary: estabelecimento.participante.contatos[0].email,
              substitutions: {
                fornecedor: fornecedor.participante.nome,
                documento: _formatarDocumento(fornecedor.participante.documento),
                linkFornecedoresCessao: `${mailerSettings.baseUrl}/estabelecimento/fornecedores`,
              },
            }),
            mailer.enviar({
              templateName: emailTemplates.INDICACAO_ESTABELECIMENTO_FORNECEDOR,
              destinatary: req.user.email,
              substitutions: {
                estabelecimento: estabelecimento.participante.nome,
                linkSolicitarCessao: `${mailerSettings.baseUrl}/fornecedor/estabelecimentos`,
              },
            }),
            /* eslint-enable max-len */
          ]));
        }).then(() => res.end())
        .catch(error => res.catch(error));
    };
  }
  this.vincularFornecedor = vincular(true);
  this.vincularEstabelecimento = vincular(false);

  function obterVinculos(identityName, solicitadoEstabelecimento) {
    return (req, res) => {
      const id = +req.user.participante;
      const statusVinculo = +req.query.status;

      const include = [];

      if (solicitadoEstabelecimento) {
        include.push({
          model: db.entities.participanteFornecedor,
          as: 'fornecedor',
          attributes: ['participanteId'],
          include: [{
            model: db.entities.participante,
            as: 'participante',
            attributes: ['id', 'nome', 'documento'],
          }],
        });
      } else {
        include.push({
          model: db.entities.participanteEstabelecimento,
          as: 'estabelecimento',
          attributes: ['participanteId'],
          include: [{
            model: db.entities.participante,
            as: 'participante',
            attributes: ['id', 'nome', 'documento'],
          }],
        });
      }

      db.entities[identityName].findOne({
        where: { participanteId: id },
        include: [{
          model: db.entities.participanteVinculo,
          as: 'vinculos',
          attributes: [
            'id',
            'usuario',
            'status',
            'exibeValorDisponivel',
            'diasAprovacao',
            'createdAt',
            'valorMaximoExibicao',
          ],
          where: { status: statusVinculo },
          include,
        }],
      }).then((participante) => {
        if (!participante) {
          res.send([]);
          return;
        }

        res.send(participante.vinculos.map(t => ({
          id: t.id,
          participante: (t.fornecedor || t.estabelecimento)
            .dataValues.participante,
          status: t.status,
          exibeValorDisponivel: t.exibeValorDisponivel,
          valorMaximoExibicao: t.valorMaximoExibicao,
          diasAprovacao: t.diasAprovacao,
          dataCadastro: t.createdAt,
        })));
      }).catch(error => res.catch(error));
    };
  }
  this.obterEstabelecimentoVinculos = obterVinculos(
    'participanteEstabelecimento', true
  );

  this.obterFornecedoresIndicados = (req, res) => {
    const establishment = +req.user.participante;

    return useCasesParticipante.getProviderNominees(establishment)
      .then(arr => res.send(arr))
      .catch(error => res.catch(error));
  };

  this.updateFornecedorIndicado = (req, res) => {
    const idEc = +req.user.participante;
    const indication = req.body;

    return useCasesParticipante.updateProviderNominees(indication, idEc)
      .then(() => res.end())
      .catch(error => res.catch(error));
  };

  this.obterFornecedorVinculos = (req, res) => {
    const fornecedorId = +req.user.participante;
    const {
      status,
      nome,
      documento,
      dataCadastroInicio,
      dataCadastroFim,
    } = req.query;

    return getProviderLinks(db, siscofWrapper)(
      fornecedorId,
      status,
      nome,
      documento,
      dataCadastroInicio,
      dataCadastroFim
    )
      .then(arr => res.send(arr))
      .catch(error => res.catch(error));
  };

  this.obterFornecedorIndicacoesReprovadas = (req, res) => {
    const fornecedorId = +req.user.participante;
    const {
      nome,
      documento,
      dataCadastroInicio,
      dataCadastroFim,
    } = req.query;

    return getProviderNominations(db)(
      fornecedorId,
      indicacaoStatus.reprovado,
      nome,
      documento,
      dataCadastroInicio,
      dataCadastroFim
    )
      .then(arr => res.send(arr))
      .catch(error => res.catch(error));
  };

  this.obterFornecedorVinculosPendentes = (req, res) => {
    const fornecedorId = +req.user.participante;
    const {
      nome,
      documento,
      dataCadastroInicio,
      dataCadastroFim,
    } = req.query;

    return Promise.all([
      getProviderNominations(db)(
        fornecedorId,
        indicacaoStatus.pendente,
        nome,
        documento,
        dataCadastroInicio,
        dataCadastroFim
      ),
      getProviderRequestedLinks(db)(
        fornecedorId,
        vinculoStatus.pendente,
        nome,
        documento,
        dataCadastroInicio,
        dataCadastroFim,
      ),
    ])
      .then(results => res.send(results[0].concat(results[1])))
      .catch(error => res.catch(error));
  };

  function notificarIndicacao(vinculo) {
    const contatoInclude = () => ({
      model: db.entities.participanteContato,
      as: 'contatos',
      attributes: ['participanteId', 'email'],
      where: { ativo: true },
    });

    const participanteInclude = () => ({
      model: db.entities.participante,
      as: 'participante',
      attributes: ['id', 'nome'],
      include: [contatoInclude()],
      where: { ativo: true },
    });

    return Promise.all([
      db.entities.participanteFornecedor.findOne({
        where: { participanteId: vinculo.participanteFornecedorId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
      db.entities.participanteEstabelecimento.findOne({
        where: { participanteId: vinculo.participanteEstabelecimentoId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
    ]).then((results) => {
      const fornecedor = results[0];
      const estabelecimento = results[1];

      if (vinculo.status === vinculoStatus.aprovado) {
        return mailer.enviar({
          templateName: emailTemplates.INDICACAO_ESTABELECIMENTO_ACEITA,
          destinatary: fornecedor.participante.contatos[0].email,
          substitutions: {
            estabelecimento: estabelecimento.participante.nome,
            linkSolicitarCessao:
              `${mailerSettings.baseUrl}/fornecedor/estabelecimentos`,
          },
        });
      }

      if (vinculo.status === vinculoStatus.reprovado) {
        return mailer.enviar({
          templateName: emailTemplates.INDICACAO_ESTABELECIMENTO_RECUSADA,
          destinatary: fornecedor.participante.contatos[0].email,
          substitutions: {
            estabelecimento: estabelecimento.participante.nome,
          },
        });
      }

      return null;
    });
  }

  function alterarStatus(novoStatus) {
    return (req, res) => {
      const id = +req.body.id;
      const estabelecimentoId = +req.user.participante;

      return db.entities.participanteVinculo.findOne({
        where:
        {
          id,
          participanteEstabelecimentoId: estabelecimentoId,
        },
      })
        .then((vinculo) => {
          if (!vinculo) {
            throw String('vinculo-nao-encontrado');
          }

          return siscofWrapper.incluirExcluirCessionarioEC(
            vinculo.participanteFornecedorId,
            vinculo.participanteEstabelecimentoId,
            novoStatus
          )
            .then(() => {
              vinculo.status = novoStatus;

              if (novoStatus === vinculoStatus.aprovado
                || novoStatus === vinculoStatus.reprovado) {
                vinculo.dataRespostaEstabelecimento = new Date();
                vinculo.usuarioRespostaEstabelecimento = req.user.email;
              }

              if (novoStatus === vinculoStatus.cancelado
                || novoStatus === vinculoStatus.reprovado) {
                vinculo.motivoTipoRecusaId = +req.body.motivoTipoRecusaId;
                vinculo.motivoRecusaObservacao = req.body.observacao;
              }

              return Promise.all([
                vinculo.save(),
                db.entities.participanteVinculoHistorico.create({
                  participanteEstabelecimentoId:
                    vinculo.participanteEstabelecimentoId,
                  participanteFornecedorId:
                    vinculo.participanteFornecedorId,
                  status: vinculo.status,
                  usuario: vinculo.usuario,
                  exibeValorDisponivel: vinculo.exibeValorDisponivel,
                  diasAprovacao: vinculo.diasAprovacao,
                  dataRespostaEstabelecimento: new Date(),
                  usuarioRespostaEstabelecimento: req.user.email,
                }),
                notificarIndicacao(vinculo),
              ]);
            });
        })
        .then(() => res.end())
        .catch(error => res.catch(error));
    };
  }
  this.aprovarVinculoFornecedor = alterarStatus(vinculoStatus.aprovado);
  this.recusarVinculoFornecedor = alterarStatus(vinculoStatus.reprovado);
  this.cancelarVinculoFornecedor = alterarStatus(vinculoStatus.cancelado);
  this.reativarVinculoFornecedor = alterarStatus(vinculoStatus.aprovado);

  function notificarFornecedorSobreValorDisponivel(
    solicitadoEstabelecimento,
    vinculo
  ) {
    if (solicitadoEstabelecimento === false) return Promise.resolve();

    const contatoInclude = () => ({
      model: db.entities.participanteContato,
      as: 'contatos',
      attributes: ['participanteId', 'email'],
      where: { ativo: true },
    });

    const participanteInclude = () => ({
      model: db.entities.participante,
      as: 'participante',
      attributes: ['id', 'nome'],
      include: [contatoInclude()],
      where: { ativo: true },
    });

    return Promise.all([
      db.entities.participanteFornecedor.findOne({
        where: { participanteId: vinculo.participanteFornecedorId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
      db.entities.participanteEstabelecimento.findOne({
        where: { participanteId: vinculo.participanteEstabelecimentoId },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
    ]).then((results) => {
      const fornecedor = results[0];
      const estabelecimento = results[1];

      if (!estabelecimento.participante.contato) {
        return null;
      }

      if (vinculo.exibeValorDisponivel) {
        return mailer.enviar({
          templateName: emailTemplates.LIBERACAO_VALOR_DISPONIVEL_FORNECEDOR,
          destinatary: estabelecimento.participante.contatos[0].email,
          substitutions: {
            fornecedor: fornecedor.participante.nome,
            linkAlteracaoValorDisponivel:
              `${mailerSettings.baseUrl}/estabelecimento/fornecedores`,
          },
        });
      }

      return mailer.enviar({
        templateName: emailTemplates.CANCELAMENTO_VALOR_DISPONIVEL_FORNECEDOR,
        destinatary: estabelecimento.participante.contatos[0].email,
        substitutions: {
          fornecedor: fornecedor.participante.nome,
          linkAlteracaoValorDisponivel:
            `${mailerSettings.baseUrl}/estabelecimento/fornecedores`,
        },
      });
    }).catch(e => console.log(e));
  }

  function alterarVinculo(solicitadoEstabelecimento) {
    return (req, res) => {
      const id = +req.body.vinculoId;
      const participanteId = +req.user.participante;
      const where = { id };

      if (!id) {
        res.catch(`invalid-vinculo-id${req.body.vinculoId}`);
        return;
      }

      if (!participanteId) {
        res.catch(`invalid-participante-id${req.user.participante}`);
        return;
      }

      if (solicitadoEstabelecimento) {
        where.participanteEstabelecimentoId = participanteId;
      } else {
        where.participanteFornecedorId = participanteId;
      }

      db.entities.participanteVinculo
        .findOne({ where })
        .then((vinculo) => {
          if (!vinculo) {
            throw String('vinculo-nao-encontrato');
          }

          if (solicitadoEstabelecimento) {
            vinculo.exibeValorDisponivel = req.body.exibeValorDisponivel;
            vinculo.valorMaximoExibicao = req.body.valorMaximoExibicao;
          } else {
            vinculo.diasAprovacao = +req.body.diasAprovacao;
          }

          return Promise.all([
            vinculo.save(),
            db.entities.participanteVinculoHistorico.create({
              participanteEstabelecimentoId:
                vinculo.participanteEstabelecimentoId,
              participanteFornecedorId: vinculo.participanteFornecedorId,
              status: vinculo.status,
              exibeValorDisponivel: vinculo.exibeValorDisponivel,
              valorMaximoExibicao: vinculo.valorMaximoExibicao,
              diasAprovacao: vinculo.diasAprovacao,
              usuario: req.user.email,
            }),
            notificarFornecedorSobreValorDisponivel(
              solicitadoEstabelecimento,
              vinculo
            ),
          ]);
        })
        .then(() => res.end())
        .catch(error => res.catch(error));
    };
  }
  this.alterarVinculoComEC = alterarVinculo(false);
  this.alterarVinculoComFornecedor = alterarVinculo(true);

  this.obterVinculo = (req, res) => {
    const vinculoId = +req.params.id;
    const include = [{
      model: db.entities.participanteEstabelecimento,
      as: 'estabelecimento',
      include: [{
        model: db.entities.participante,
        as: 'participante',
        attributes: ['id', 'documento', 'nome'],
      }],
    }];

    return vinculoService
      .obterVinculoPorId(vinculoId, include)
      .then(vinculo => res.send(vinculo))
      .catch(e => res.catch(e));
  };

  this.obterValorVinculo = (req, res) => {
    const fornecedorId = +req.user.participante;
    const estabelecimentoId = +req.params.estabelecimentoId;

    return vinculoService
      .obterVinculoPorIdParticipantes(estabelecimentoId, fornecedorId)
      .then(vinculo => res.send({ valor: vinculo.valor }))
      .catch(err => res.catch(err));
  };

  // Métodos de consulta para o participante
  function detalheCadastro(participanteId) {
    return db.entities.participante.findOne({
      where: {
        id: participanteId,
      },
      attributes: [
        'id',
        'tipoPessoa',
        'documento',
        'nome',
        'razaoSocial',
        'nomeMae',
        'inscricaoEstadual',
        'inscricaoMunicipal',
        'cep',
        'logradouro',
        'numero',
        'complemento',
        'bairro',
      ],
      include: [
        {
          model: db.entities.cidade,
          as: 'cidade',
          attributes: ['nome', 'estado'],
        },
      ],
    });
  }

  function detalheContato(participanteId) {
    return db.entities.participante.findOne({
      where: {
        id: participanteId,
      },
      attributes: [
        'id',
        'tipoPessoa',
        'documento',
      ],
      include: [
        {
          model: db.entities.participanteContato,
          as: 'contatos',
          attributes: ['nome', 'email', 'telefone', 'celular'],
          where: {
            ativo: true,
          },
        },
      ],
    })
      .then((participante) => {
        // eslint-disable-next-line prefer-destructuring
        const contato = (
          (participante.contatos || []).length > 0
            ? participante.contatos[0]
            : null
        );

        return {
          id: participante.id,
          tipoPessoa: participante.tipoPessoa,
          documento: participante.documento,
          contato,
        };
      });
  }

  function detalheDomiciliosBancarios(participanteId) {
    const bandeiraInclude = () => ({
      model: db.entities.bandeira,
      as: 'bandeira',
      attributes: ['id', ['nome', 'text']],
    });

    return db.entities.participante.findOne({
      where: {
        id: participanteId,
      },
      attributes: [
        'id',
        'tipoPessoa',
        'documento',
        'arquivos',
      ],
      include: [
        {
          model: db.entities.participanteDomicilioBancario,
          as: 'domiciliosBancarios',
          attributes: [
            'bancoId',
            'bancoNome',
            'agencia',
            'conta',
            'digito',
          ],
          include: [bandeiraInclude()],
        },
      ],
    })
      .then(participante => ({
        id: participante.id,
        tipoPessoa: participante.tipoPessoa,
        documento: participante.documento,
        arquivos: ((participante.arquivos || {}).extratosBancarios || []),
        domiciliosBancarios: participante.domiciliosBancarios,
      }));
  }

  function detalheCondicoesComerciais(participanteId) {
    const bandeiraInclude = () => ({
      model: db.entities.bandeira,
      as: 'bandeira',
      attributes: ['id', ['nome', 'text']],
    });

    return db.entities.credenciamento.findOne({
      where: {
        participanteId,
        ativo: true,
      },
      attributes: ['id', 'taxaContratualId'],
      include: [
        {
          model: db.entities.participante,
          as: 'participante',
          attributes: [
            'id',
            'tipoPessoa',
            'documento',
          ],
          required: true,
          include: [
            {
              model: db.entities.participanteTaxa,
              as: 'taxas',
              attributes: ['taxa'],
              where: {
                participanteTaxaTipo: tipoTaxa.antecipacao,
              },
            },
          ],
        },
        {
          model: db.entities.credenciamentoCaptura,
          as: 'capturas',
          attributes: ['id', 'quantidade'],
          include: [{
            model: db.entities.captura,
            as: 'captura',
            attributes: ['id', 'tipoCaptura', 'valor'],
            include: [{
              model: db.entities.produto,
              as: 'produto',
              attributes: ['id', 'nome'],
            }],
          }],
        },
        {
          model: db.entities.taxaContratual,
          as: 'taxaContratual',
          attributes: ['id', 'antecipacao', 'adesao', 'maximoParcelas'],
        },
        {
          model: db.entities.credenciamentoTaxaAdministrativa,
          as: 'taxasAdministrativas',
          attributes: ['id', 'valor'],
          include: [{
            model: db.entities.taxaAdministrativa,
            as: 'taxaAdministrativa',
            attributes: ['id'],
            include: [
              bandeiraInclude(),
              {
                model: db.entities.taxaPrazo,
                as: 'taxaPrazo',
                attributes: [
                  'id', 'coeficiente', 'prazo', 'minimo', 'maximo',
                ],
              },
            ],
          }],
        },
        {
          model: db.entities.credenciamentoTaxaDebito,
          as: 'taxasDebito',
          attributes: ['id', 'valor'],
          include: [{
            model: db.entities.taxaBandeira,
            as: 'taxaBandeira',
            attributes: ['id'],
            include: [bandeiraInclude()],
          }],
        },
      ],
    })
      .then((credenciamento) => {
        const { participante } = credenciamento;
        return {
          id: participante.id,
          tipoPessoa: participante.tipoPessoa,
          documento: participante.documento,
          credenciamento: credenciamento.id,
          captura: {
            url: credenciamento.ecommerce,
            capturas: credenciamento.capturas,
          },
          condicoesComerciais: {
            taxaContratual: {
              ...credenciamento.taxaContratual.dataValues,
              antecipacao: participante.taxas[0].taxa,
            },
            taxasDebito: credenciamento.taxasDebito.map(t => ({
              id: t.taxaBandeira.id,
              idTaxaCredenciamento: t.id,
              valor: t.valor,
              bandeira: t.taxaBandeira.bandeira,
            })),
            taxasAdministrativas: credenciamento.taxasAdministrativas.map(
              t => ({
                id: t.taxaAdministrativa.id,
                idTaxaCredenciamento: t.id,
                valor: t.valor,
                bandeira: t.taxaAdministrativa.bandeira,
                prazo: t.taxaAdministrativa.taxaPrazo.prazo,
                coeficiente: t.taxaAdministrativa.taxaPrazo.coeficiente,
                opcoesParcelamento: {
                  minimoParcelas: t.taxaAdministrativa.taxaPrazo.minimo,
                  maximoParcelas: t.taxaAdministrativa.taxaPrazo.maximo,
                },
              })
            ),
          },
        };
      });
  }

  function downloadExtrato(participanteId, index) {
    return db.entities.participante
      .findOne({
        where: {
          id: participanteId,
        },
        attributes: ['documento'],
      })
      .then((participante) => {
        if (!participante) throw String('participante-nao-encontrado');

        return fetchFile(
          'extratosBancarios', index, participante.documento, participanteId
        );
      });
  }

  function sendBlobResponse(data, res) {
    res.set({
      'Content-Type': data.ContentType,
      'Content-Disposition': `attachment; filename=${data.filename}`,
    });

    res.write(data.Body);
    res.end();
  }

  this.obterDetalheCadastro = (req, res) => {
    const participanteId = +req.user.participante;
    return detalheCadastro(participanteId)
      .then(data => res.send(data))
      .catch(error => res.catch(error));
  };

  this.obterDetalheContato = (req, res) => {
    const participanteId = +req.user.participante;
    return detalheContato(participanteId)
      .then(data => res.send(data))
      .catch(error => res.catch(error));
  };

  this.obterDetalheDomiciliosBancarios = (req, res) => {
    const participanteId = +req.user.participante;
    return detalheDomiciliosBancarios(participanteId)
      .then(data => res.send(data))
      .catch(error => res.catch(error));
  };

  this.obterDetalheCondicoesComerciais = (req, res) => {
    const participanteId = +req.user.participante;
    return detalheCondicoesComerciais(participanteId)
      .then(data => res.send(data))
      .catch(error => res.catch(error));
  };

  this.obterExtrato = (req, res) => {
    const participanteId = +req.user.participante;
    const index = +req.params.indice;
    return downloadExtrato(participanteId, index)
      .then(data => sendBlobResponse(data, res))
      .catch(() => res.catch('download-extratosBancarios'));
  };

  this.obterExtratoBackoffice = (req, res) => {
    const participanteId = +req.params.id;
    const index = +req.params.indice;
    return downloadExtrato(participanteId, index)
      .then(data => sendBlobResponse(data, res))
      .catch(() => res.catch('download-extratosBancarios'));
  };

  this.pesquisarIndicacoesEc = (req, res) => {
    const { query } = req;
    return indicacoesEc(query)
      .then(data => res.send(data))
      .catch(err => res.catch(err));
  };

  this.reprovarIndicacao = (req, res) => {
    const { obervacao } = req.body;
    const { email } = req.user;
    const id = +req.params.id;
    const motivoId = +req.body.motivoId;
    return reprovarIndicacao(id, motivoId, obervacao, email)
      .then(() => res.end())
      .catch(err => res.catch(err));
  };

  return Promise.resolve(this);
}

module.exports = di => di
  .provide(
    '#participantes',
    '$main-db',
    '$vinculo-service',
    '$siscof-wrapper',
    '$mailer',
    '@@email-templates',
    '@mailer-settings',
    '$fileStorage',
    Controller
  )
  .init(
    '#participantes',
    '$server',
    '$auth',
    '@@roles',
    (
      controller,
      server,
      auth,
      roles
    ) => {
      const requireBackoffice = auth.require(
        roles.boAdministrador, roles.boOperacoes
      );
      const requireFornecedor = auth.require(
        roles.boAdministrador,
        roles.boOperacoes,
        roles.fcAdministrador,
        roles.fcFinanceiro,
        roles.fcComercial
      );
      const requireEstabelecimento = auth.require(
        roles.boAdministrador,
        roles.boOperacoes,
        roles.ecAdministrador,
        roles.ecFinanceiro,
        roles.ecCompras
      );
      const somenteEstabelecimento = auth.requireParticipante(
        tiposParticipante.estabelecimento
      );
      const somenteFornecedor = auth.requireParticipante(
        tiposParticipante.fornecedor
      );

      // Endpoints BKO
      server.get(
        '/participantes',
        auth.require(
          roles.boAdministrador,
          roles.boOperacoes
        ),
        controller.pesquisarParticipantes
      );

      server.get(
        '/estabelecimento/indicacoes',
        auth.require(
          roles.boAdministrador,
          roles.boOperacoes
        ),
        controller.pesquisarIndicacoesEc,
      );

      server.post(
        '/estabelecimento/indicacoes/:id/reprovar',
        auth.require(
          roles.boAdministrador,
          roles.boOperacoes
        ),
        controller.reprovarIndicacao,
      );

      // Endpoints para o participante
      server.get(
        '/participante/detalhe/cadastro',
        auth.requireParticipante(
          tiposParticipante.estabelecimento,
          tiposParticipante.fornecedor
        ),
        controller.obterDetalheCadastro
      );

      server.get(
        '/participante/detalhe/contato',
        auth.requireParticipante(
          tiposParticipante.estabelecimento,
          tiposParticipante.fornecedor
        ),
        controller.obterDetalheContato
      );

      server.get(
        '/participante/detalhe/domiciliosbancarios',
        auth.requireParticipante(
          tiposParticipante.estabelecimento,
          tiposParticipante.fornecedor
        ),
        controller.obterDetalheDomiciliosBancarios
      );

      server.get(
        '/participante/detalhe/condicoescomerciais',
        auth.requireParticipante(
          tiposParticipante.estabelecimento,
          tiposParticipante.fornecedor
        ),
        controller.obterDetalheCondicoesComerciais
      );

      server.get(
        '/participante/extrato/:indice',
        auth.requireParticipante(
          tiposParticipante.estabelecimento,
          tiposParticipante.fornecedor
        ),
        controller.obterExtrato
      );

      server.get(
        '/participante/:id/extrato/:indice',
        requireBackoffice,
        controller.obterExtratoBackoffice
      );

      server.get('/fornecedor/:documento', controller.procurarFornecedor);
      server.get('/fornecedores', controller.obterFornecedores);

      server.get(
        '/fornecedor/:id/estabelecimentos',
        requireFornecedor,
        somenteFornecedor,
        controller.obterFornecedorVinculos
      );
      server.get(
        '/fornecedor/estabelecimentos/pendentes',
        requireFornecedor,
        somenteFornecedor,
        controller.obterFornecedorVinculosPendentes
      );
      server.get(
        '/fornecedor/estabelecimentos/reprovados',
        requireFornecedor,
        somenteFornecedor,
        controller.obterFornecedorIndicacoesReprovadas
      );
      server.get(
        '/vinculo/:id',
        requireFornecedor,
        somenteFornecedor,
        controller.obterVinculo
      );
      server.post(
        '/fornecedores/indicacoes',
        requireEstabelecimento,
        somenteEstabelecimento,
        controller.indicarFornecedor
      );
      server.post(
        '/fornecedor/:id/estabelecimento/:establecimentoId/vinculo/alterar',
        requireFornecedor,
        somenteFornecedor,
        controller.alterarVinculoComEC
      );
      server.post(
        '/fornecedor/:id/estabelecimento',
        requireFornecedor,
        somenteFornecedor,
        controller.vincularEstabelecimento
      );

      server.get(
        '/estabelecimentos',
        controller.obterEstabelecimentos
      );
      server.get(
        '/estabelecimento/:documento',
        controller.procurarEstabelecimento
      );

      server.get(
        '/estabelecimento/:id/fornecedores',
        requireEstabelecimento,
        somenteEstabelecimento,
        controller.obterEstabelecimentoVinculos
      );
      server.get(
        '/estabelecimento/:id/indicacoes',
        requireEstabelecimento,
        somenteEstabelecimento,
        controller.obterFornecedoresIndicados
      );

      server.post(
        '/estabelecimento/:id/indicacao/:indicacaoId/alterar',
        requireEstabelecimento,
        somenteEstabelecimento,
        controller.updateFornecedorIndicado
      );
      server.post(
        '/estabelecimento/:id/fornecedor',
        requireEstabelecimento,
        somenteEstabelecimento,
        controller.vincularFornecedor
      );
      server.post(
        '/estabelecimento/:id/fornecedor/:fornecedorId/vinculo/alterar',
        requireEstabelecimento,
        somenteEstabelecimento,
        controller.alterarVinculoComFornecedor
      );
      server.post(
        '/estabelecimento/:id/fornecedor/:fornecedorId/aprovar',
        requireEstabelecimento,
        somenteEstabelecimento,
        controller.aprovarVinculoFornecedor
      );
      server.post(
        '/estabelecimento/:id/fornecedor/:fornecedorId/recusar',
        requireEstabelecimento,
        somenteEstabelecimento,
        controller.recusarVinculoFornecedor
      );
      server.post(
        '/estabelecimento/:id/fornecedor/:fornecedorId/cancelar',
        requireEstabelecimento,
        somenteEstabelecimento,
        controller.cancelarVinculoFornecedor
      );
      server.post(
        '/estabelecimento/:id/fornecedor/:fornecedorId/reativar',
        requireEstabelecimento,
        somenteEstabelecimento,
        controller.reativarVinculoFornecedor
      );

      // APIs para compatibilidade com o Gateway
      // TODO: Rever forma de consumir essas APIs
      server.get(
        '/fornecedor/:fornecedorId/estabelecimento/:estabelecimentoId/vinculo',
        requireFornecedor,
        somenteFornecedor,
        controller.obterValorVinculo
      );
    }
  );
