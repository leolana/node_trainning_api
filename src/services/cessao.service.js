const cessionService = require('../service/cessao/index');

function service(db, siscofWrapper, mailer, emailTemplates, mailerSettings) {
  const validaCessao = cessionService.validate;
  const resolverCessao = cessionService.resolve(db, siscofWrapper);
  const notificarCessao = cessionService.notificate(
    mailer,
    emailTemplates,
    mailerSettings,
  );
  const aprovarReprovarCessao = cessionService.approveDisapprove(
    db,
    siscofWrapper,
    mailer,
    emailTemplates,
    mailerSettings,
  );
  const verificaRecorrencia = cessionService.checkRecurrence(db);

  const verificaRecorrenciaPorId = cessionService.checkRecurrenceById(db);

  const verificaRecorrenciaPorIdVinculo = vinculoId => {
    const action = verificaRecorrenciaPorId('vinculo', vinculoId);
    return action;
  };

  const verificaRecorrenciaPorIdParticipantes = (
    estabelecimentoId,
    fornecedorId,
  ) => {
    const action = verificaRecorrenciaPorId(
      'participantes',
      estabelecimentoId,
      fornecedorId,
    );
    return action;
  };

  const validaCessaoRecorrente = cessionService.validateRecurrence(db);

  return Promise.resolve({
    aprovarReprovarCessao,
    resolverCessao,
    notificarCessao,
    validaCessao,
    validaCessaoRecorrente,
    verificaRecorrenciaPorIdParticipantes,
    verificaRecorrenciaPorIdVinculo,
    verificaRecorrencia,
  });
}

module.exports = di => {
  di.provide(
    '$cessao-service',
    '$main-db',
    '$siscof-wrapper',
    '$mailer',
    '@@email-templates',
    '@mailer-settings',
    service,
  );
};
