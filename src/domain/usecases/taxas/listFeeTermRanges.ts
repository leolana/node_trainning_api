const listFeeTermRanges = db => () => {
  /* RETORNA: [
    { minimo: 1, maximo: 1, descricao: 'À Vista' },
    { minimo: 2, maximo: 6, descricao: '2 à 6 parcelas' },
    { minimo: 7, maximo: 12, descricao: '7 à 12 parcelas' },
  ] */

  const action = db.entities.taxaPrazo
    .findAll({
      attributes: ['minimo', 'maximo'],
      group: ['minimo', 'maximo'],
      order: [['minimo', 'ASC'], ['maximo', 'ASC']],
    })
    .then((ranges) => {
      return ranges.map(range => ({
        minimo: range.minimo,
        maximo: range.maximo,
        descricao:
          range.maximo === 1
            ? 'À Vista'
            : `${range.minimo} à ${range.maximo} parcelas`,
      }));
    });

  return action;
};

export default listFeeTermRanges;
