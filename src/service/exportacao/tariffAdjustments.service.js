module.exports = siscofWrapper => (
  participantId,
  startDate,
  endDate
) => siscofWrapper
  .exportarAjustesTarifas(participantId, startDate, endDate);
