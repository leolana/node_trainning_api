module.exports = db => () => {
  /* RETORNA: [
    { prazo: 33, disabled: true },
    { prazo: 14, disabled: false },
    { prazo: 3, disabled: false },
  ] */

  const action = db.entities.taxaPrazo
    .findAll({
      attributes: ['prazo'],
      group: ['prazo'],
      order: [['prazo', 'DESC']],
    })
    .then(prazos => {
      prazos = prazos.map(prazo => ({
        prazo: prazo.prazo,
        disabled: prazo.prazo === 33,
      }));
      return prazos;
    });

  return action;
};
