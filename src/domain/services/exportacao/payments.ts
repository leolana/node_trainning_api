const payments = siscofWrapper => (
  participantId,
  startDate,
  endDate
) => siscofWrapper
  .exportarPagamentos(participantId, startDate, endDate);

export default payments;
