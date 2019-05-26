module.exports = siscofWrapper => (
  participantId,
  startDate,
  endDate
) => siscofWrapper
  .exportarRemessaVendas(participantId, startDate, endDate);
