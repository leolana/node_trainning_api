const tariffAdjustments = siscofWrapper => (
  participantId,
  startDate,
  endDate
) => siscofWrapper
  .exportarAjustesTarifas(participantId, startDate, endDate);

export default tariffAdjustments;
