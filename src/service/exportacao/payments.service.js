module.exports = siscofWrapper => (
  participantId,
  startDate,
  endDate
) => siscofWrapper
  .exportarPagamentos(participantId, startDate, endDate);
