const salesRegistrySummary = siscofWrapper => (
  participantId,
  startDate,
  endDate
) => siscofWrapper
  .exportarRegistroVendasResumo(participantId, startDate, endDate);

export default salesRegistrySummary;
