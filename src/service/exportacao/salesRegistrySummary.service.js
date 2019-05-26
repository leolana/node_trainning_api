module.exports = siscofWrapper => (
  participantId,
  startDate,
  endDate
) => siscofWrapper
  .exportarRegistroVendasResumo(participantId, startDate, endDate);
