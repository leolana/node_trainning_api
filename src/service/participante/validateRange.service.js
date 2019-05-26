

module.exports = (ranges) => {
  ranges = ranges.map(r => ({
    ...r,
    valorInicio: parseFloat(r.valorInicio),
    valorFim: parseFloat(r.valorFim),
  }));

  if (ranges.some(taxa => taxa.valorInicio > taxa.valorFim)) {
    return String('valor-inicio-maior');
  }
  const everyRangeValid = ranges
    .sort((a, b) => a.valorInicio - b.valorInicio)
    .every((range, i) => {
      if (i > 0) {
        const lastValorFim = ranges[i - 1].valorFim;
        return range.valorInicio > lastValorFim;
      }
      return true;
    });

  if (!everyRangeValid) return String('range-invalid');
  return null;
};
