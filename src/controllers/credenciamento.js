/* eslint-disable max-len */
const credeciamentoStatus = require('../service/credenciamento/accreditationStatus.enum');
const usecases = require('../usecase/credenciamento');

const controller = (
  db,
  auth,
  fileStorage,
  siscofWrapper,
  mailer,
  mailerSettings,
  logger
) => {
  const accreditation = usecases(
    db, auth, fileStorage, siscofWrapper, mailer, mailerSettings
  );

  const sendBlobResponse = (data, res) => {
    res.set({
      'Content-Type': data.ContentType,
      'Content-Disposition': `attachment; filename=${data.filename}`,
    });

    res.write(data.Body);
    res.end();
  };

  const list = (req, res) => accreditation
    .search(req.query)
    .then(results => res.send(results))
    .catch(err => res.catch(err));

  const get = (req, res) => accreditation
    .details(+req.params.id)
    .then(results => res.send(results))
    .catch(err => res.catch(err));

  const mutate = (req, res) => {
    const { files } = req;
    const user = req.user.email;
    const data = JSON.parse(req.body.data);

    const { documento } = data.dadosCadastrais;

    let unchangedFiles = null;

    if (req.body.unchangedFiles) {
      unchangedFiles = JSON.parse(req.body.unchangedFiles);
    }

    const method = data.dadosCadastrais.id
      ? accreditation.edit(data, files, documento, user, unchangedFiles)
      : accreditation.add(data, files, documento, user);

    return method
      .then(() => res.end())
      .catch((err) => {
        logger.error(err);
        return res.catch(err);
      });
  };

  const analyze = (req, res) => {
    const credenciamentoId = +req.params.id;

    return accreditation.canAnalyze(credenciamentoId)
      .then(() => accreditation.changeStatus(
        credenciamentoId,
        req.user.email,
        credeciamentoStatus.emAnalise,
      ))
      .then(results => res.send(results))
      .catch(err => res.catch(err));
  };

  const reject = (req, res) => {
    const credenciamentoId = +req.params.id;

    return accreditation.canReject(credenciamentoId)
      .then(() => accreditation.changeStatus(
        credenciamentoId,
        req.user.email,
        credeciamentoStatus.reprovado,
      ))
      .then(results => res.send(results))
      .catch(err => res.catch(err));
  };

  const approve = (req, res) => {
    const credenciamentoId = +req.params.id;

    return accreditation.canApprove(credenciamentoId)
      .then(() => accreditation.approve(
        credenciamentoId,
        req.user.email,
      ))
      .then(results => res.send(results))
      .catch(err => res.catch(err));
  };

  const addAnalysisFile = (req, res) => {
    const id = +req.params.id;
    const user = req.user.email;
    const { files } = req;
    const data = JSON.parse(req.body.data);

    return accreditation
      .addAnalysisFile(id, files, data, user)
      .then(files => res.send(files))
      .catch(err => res.catch(err));
  };

  const addSuggestion = (req, res) => {
    const document = req.body.documento;
    const participantId = +req.user.participante;
    const personType = +req.body.tipoPessoa;
    const name = req.body.nome;
    const user = req.user.email;
    const { status } = req.body;
    const { files } = req;

    return accreditation
      .suggest(participantId, document, name, status, personType, files, user)
      .then(() => res.end())
      .catch(err => res.catch(err));
  };

  const getAccreditationFile = (req, res) => {
    const type = req.params.tipo;
    const index = req.params.indice;
    const document = req.params.documento;

    return accreditation.fetchFile
      .accreditation(type, index, document)
      .then(data => sendBlobResponse(data, res))
      .catch(() => res.catch(`download-${req.params.tipo}`));
  };

  const getSuggestionFile = (req, res) => {
    const type = req.params.tipo;
    const index = req.params.indice;
    const document = req.params.documento;

    return accreditation.fetchFile
      .suggestion(type, index, document)
      .then(data => sendBlobResponse(data, res))
      .catch(() => res.catch(`download-${req.params.tipo}`));
  };

  const checkDocumentExistence = (req, res) => {
    const { documento } = req.query;

    return accreditation.checkDocumentExistence(documento)
      .then(data => res.send(data))
      .catch(err => res.catch(err));
  };

  return Promise.resolve({
    list,
    get,
    mutate,
    analyze,
    reject,
    approve,
    addAnalysisFile,
    addSuggestion,
    getAccreditationFile,
    getSuggestionFile,
    checkDocumentExistence,
  });
};

module.exports = (di) => {
  di.provide(
    '#credenciamento',
    '$main-db',
    '$auth',
    '$fileStorage',
    '$siscof-wrapper',
    '$mailer',
    '@mailer-settings',
    '$logger',
    controller
  ).init(
    '#credenciamento',
    '$server',
    '$auth',
    '@@roles',
    (
      controller,
      server,
      auth,
      roles
    ) => {
      server.get(
        '/credenciamento',
        auth.require(roles.boAdministrador, roles.boOperacoes),
        controller.list
      );
      server.get(
        '/credenciamento/:id',
        auth.require(roles.boAdministrador, roles.boOperacoes),
        controller.get
      );
      server.post(
        '/credenciamento',
        auth.require(roles.boAdministrador, roles.boOperacoes),
        controller.mutate
      );
      server.post(
        '/credenciamento/:id/analisar',
        auth.require(roles.boAdministrador, roles.boOperacoes),
        controller.analyze
      );
      server.post(
        '/credenciamento/:id/aprovar',
        auth.require(roles.boAdministrador, roles.boOperacoes),
        controller.approve
      );
      server.post(
        '/credenciamento/:id/recusar',
        auth.require(roles.boAdministrador, roles.boOperacoes),
        controller.reject
      );
      server.post(
        '/credenciamento/:id/arquivos/analise',
        auth.require(roles.boAdministrador, roles.boOperacoes),
        controller.addAnalysisFile
      );
      server.get(
        '/credenciamento/:documento/arquivos/:tipo/:indice',
        auth.require(roles.boAdministrador, roles.boOperacoes),
        controller.getAccreditationFile
      );
      server.get(
        '/credenciamentoProposta/:documento/arquivos/:tipo/:indice',
        auth.require(roles.boAdministrador, roles.boOperacoes),
        controller.getSuggestionFile
      );
      server.post(
        '/credenciamento/pre-cadastro',
        auth.require(
          roles.fcAdministrador,
          roles.fcFinanceiro,
          roles.fcComercial
        ),
        controller.addSuggestion
      );
      server.get(
        '/checa-existencia-documento',
        auth.require(roles.boAdministrador, roles.boOperacoes),
        controller.checkDocumentExistence
      );
    }
  );
};
