module.exports = siscofWrapper => (
  participantId,
  startDate,
  endDate
) => siscofWrapper
  .exportarFinanceiro(participantId, startDate, endDate);
