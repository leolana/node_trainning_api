const financial = siscofWrapper => (
  participantId,
  startDate,
  endDate
) => siscofWrapper
  .exportarFinanceiro(participantId, startDate, endDate);

export default financial;
