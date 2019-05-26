const tiposParticipante = require('../service/participante/type.enum');
const usecases = require('../usecase/fornecedor');
const chckIndEC = require(
  '../usecase/estabelecimento/checkECIndication.usecase'
);
const indicarEC = require('../usecase/estabelecimento/newIndication.usecase');
const nomination = require('../service/participante/nominationSource.enum');
const vinculoStatus = require('../service/vinculo/status.enum');
const tiposPessoa = require('../service/participante/personType.enum');
const getIndicationEstablishment = require(
  '../usecase/fornecedor/getIndicationEstablishment.usecase'
);
const updateIndicationEstablishment = require(
  '../usecase/fornecedor/updateIndicationEstablishment.usecase'
);

const controller = (
  db,
  siscofWrapper,
  auth,
  mailer,
  mailerSettings,
  fileStorage
) => {
  const fornecedor = usecases(
    db, siscofWrapper, auth, mailer, mailerSettings, fileStorage
  );

  const methods = {};

  methods.listRegistered = (req, res) => fornecedor
    .searchRegistered(req.query)
    .then(data => res.send(data))
    .catch(err => res.catch(err));

  methods.listPending = (req, res) => fornecedor
    .searchPending(req.query)
    .then(data => res.send(data))
    .catch(err => res.catch(err));

  methods.listCanceled = (req, res) => fornecedor
    .searchCanceled(req.query)
    .then(data => res.send(data))
    .catch(err => res.catch(err));

  methods.get = (req, res) => fornecedor
    .details(+req.params.id)
    .then(data => res.send(data))
    .catch(err => res.catch(err));

  methods.getTariffs = (req, res) => fornecedor
    .tariffs(+req.user.participante)
    .then(data => res.send(data))
    .catch(err => res.catch(err));

  methods.mutate = (req, res) => {
    const { files } = req;
    const user = req.user.email;
    const data = JSON.parse(req.body.data);

    const promise = data.id
      ? fornecedor.edit(data, files, user)
      : fornecedor.add(data, files, user);

    return promise
      .then(() => res.end())
      .catch(err => res.catch(err));
  };

  methods.requestCession = (req, res) => {
    const linkId = +req.body.vinculoId;
    const { type } = req.body;

    return fornecedor.requestCession(
      req.body, linkId, type, req.user
    )
      .then(id => res.send({ id }))
      .catch(err => res.catch(err));
  };

  methods.checkDocumentIndicationEstablishment = (req, res) => {
    const { documento } = req.params;
    const fornecedorId = +req.user.participante;

    return chckIndEC(db)(fornecedorId, documento)
      .then(obj => res.send(obj))
      .catch(e => res.catch(e));
  };

  methods.rejectNomination = (req, res) => fornecedor
    .rejectNomination(req.body.documento,
      req.body.motivoTipoRecusaId, req.body.motivo, req.user.email)
    .then(() => res.end())
    .catch(err => res.catch(err));

  methods.listIdentifiers = (req, res) => fornecedor
    .searchIdentifiers(
      req.params.cnpjFornecedor, req.params.cnpjEstabelecimento
    )
    .then(data => res.send(data))
    .catch(err => res.catch(err));

  methods.getIdentifier = (req, res) => fornecedor
    .identifier(req.params.cnpjFornecedor)
    .then(data => res.send(data))
    .catch(err => res.catch(err));

  methods.indicacao = (req, res) => {
    const fornecedorId = +req.user.participante;

    const {
      documento,
      nome,
      email,
      telefone,
    } = req.body;
    const usuario = req.user.email;
    const tipoPessoa = tiposPessoa.verifyPersonType(documento);
    const canalEntrada = req.user.participanteFornecedor
      ? nomination.indicacaoPorFornecedor
      : nomination.indicacaoPorEc;

    indicarEC(db)(
      fornecedorId,
      documento,
      nome,
      email,
      telefone,
      usuario,
      tipoPessoa,
      canalEntrada,
      vinculoStatus.pendente,
    )
      .then(() => res.end())
      .catch(e => res.catch(e));
  };

  methods.getIndicationEstablishment = (req, res) => {
    const indicacaoId = +req.query.id;
    const participanteId = +req.user.participante;

    return getIndicationEstablishment(db)(indicacaoId, participanteId)
      .then(indicacao => res.send(indicacao))
      .catch(error => res.catch(error));
  };

  methods.updateIndicationEstablishment = (req, res) => {
    const participanteId = +req.user.participante;
    const usuario = req.user.email;

    return updateIndicationEstablishment(db)(
      +req.body.id,
      participanteId,
      req.body.documento,
      req.body.nome,
      req.body.email,
      req.body.telefone,
      usuario,
    )
      .then(indicacao => res.send(indicacao))
      .catch(error => res.catch(error));
  };

  methods.getProviderEstablishment = (req, res) => fornecedor
    .myEstablishments(+req.params.id)
    .then(data => res.send(data))
    .catch(err => res.catch(err));

  return Promise.resolve(methods);
};

module.exports = (di) => {
  di.provide(
    '#fornecedores',
    '$main-db',
    '$siscof-wrapper',
    '$auth',
    '$mailer',
    '@mailer-settings',
    '$fileStorage',
    controller
  ).init(
    '#fornecedores',
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

      server.get(
        '/fornecedores/cadastrados',
        requireBackoffice,
        controller.listRegistered
      );

      server.get(
        '/fornecedores/pendentes',
        requireBackoffice,
        controller.listPending
      );

      server.get(
        '/fornecedores/cancelados',
        requireBackoffice,
        controller.listCanceled
      );

      server.get(
        '/fornecedores/getById/:id',
        requireBackoffice,
        controller.get
      );

      server.get(
        '/fornecedores/tarifas',
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.getTariffs
      );

      server.post(
        '/fornecedores',
        requireBackoffice,
        controller.mutate
      );

      server.post(
        '/fornecedores/solicitarCessao',
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.requestCession
      );

      server.get(
        '/fornecedor/checa-documento-indicacao-estabelecimento/:documento',
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.checkDocumentIndicationEstablishment
      );

      server.post(
        '/fornecedor/indicar-estabelecimento',
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.indicacao
      );

      server.get(
        '/fornecedor/indicacao-estabelecimento',
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.getIndicationEstablishment
      );

      server.post(
        '/fornecedor/indicacao-estabelecimento',
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.updateIndicationEstablishment
      );

      server.post(
        '/fornecedores/recusarIndicacao',
        requireBackoffice,
        controller.rejectNomination
      );

      server.get(
        '/fornecedor/:cnpjFornecedor/estabelecimento/:cnpjEstabelecimento/',
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.listIdentifiers
      );

      server.get(
        '/fornecedor/:cnpjFornecedor/estabelecimento/',
        auth.requireParticipante(tiposParticipante.fornecedor),
        controller.getIdentifier
      );

      server.get(
        '/fornecedor/:id/vinculos',
        requireBackoffice,
        controller.getProviderEstablishment
      );
    }
  );
};
