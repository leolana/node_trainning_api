const validateRange = (ranges) => {
  const newRanges = ranges.map(r => ({
    ...r,
    valorInicio: parseFloat(r.valorInicio),
    valorFim: parseFloat(r.valorFim),
  }));

  if (newRanges.some(taxa => taxa.valorInicio > taxa.valorFim)) {
    throw new Error('valor-inicio-maior');
  }
  const everyRangeValid = newRanges
    .sort((a, b) => a.valorInicio - b.valorInicio)
    .every((range, i) => {
      if (i > 0) {
        const lastValorFim = newRanges[i - 1].valorFim;
        return range.valorInicio > lastValorFim;
      }
      return true;
    });

  if (!everyRangeValid) {
    throw new Error('range-invalid');
  }

  return null;
};

export default validateRange;
