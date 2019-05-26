const salesStatement = siscofWrapper => (
  participantId,
  startDate,
  endDate
) => siscofWrapper
  .exportarRemessaVendas(participantId, startDate, endDate);

export default salesStatement;
