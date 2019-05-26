const salesRegistryDetail = siscofWrapper => (
  participantId,
  startDate,
  endDate
) => siscofWrapper
  .exportarRegistroVendasDetalhe(participantId, startDate, endDate);

export default salesRegistryDetail;
