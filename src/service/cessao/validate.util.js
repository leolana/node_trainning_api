const { DateTime } = require('luxon');

module.exports = (valor, dataExpiracao, dataVencimento, vinculo) => {
  const today = DateTime.local().toISODate();

  const dataMinExpiracao = DateTime.fromISO(today, { zone: 'utc' })
    .plus({ day: 2 })
    .toUTC()
    .toJSDate();

  const dataMinVencimento = DateTime.fromISO(today, { zone: 'utc' })
    .plus({ day: 2 })
    .toUTC()
    .toJSDate();

  if (valor > vinculo.valorDisponivel) {
    throw String('valor-solicitado-superior-valor-disponivel');
  }

  if (dataExpiracao < dataMinExpiracao) {
    throw String('data-expiracao-anterior-prox-dois-dia');
  }

  if (dataVencimento < dataMinVencimento) {
    throw String('data-vencimento-anterior-prox-dois-dias');
  }

  if (dataExpiracao >= dataVencimento) {
    throw String('data-expiracao-posterior-vencimento');
  }

  return Promise.resolve(true);
};
