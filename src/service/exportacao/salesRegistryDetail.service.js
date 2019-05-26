module.exports = siscofWrapper => (
  participantId,
  startDate,
  endDate
) => siscofWrapper
  .exportarRegistroVendasDetalhe(participantId, startDate, endDate);
