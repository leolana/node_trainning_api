const sequelize = require('sequelize');

module.exports = db => (personType, branchType) => {
  const query = {
    where: {
      $and: [
        {
          $or: [
            { inicio: { $lte: sequelize.fn('now') } },
            { inicio: null },
          ],
        },
        {
          $or: [
            { fim: { $gte: sequelize.fn('now') } },
            { fim: null },
          ],
        },
      ],
    },
    order: [
      'inicio',
      'fim',
      'tipoPessoa',
      'ramoAtividadeCodigo',
    ],
    attributes: ['antecipacao'],
  };

  if (personType) {
    query.where.$and.push({
      $or: [
        { tipoPessoa: personType },
        { tipoPessoa: null },
      ],
    });
  }

  if (branchType) {
    query.where.$and.push({
      $or: [
        { ramoAtividadeCodigo: branchType },
        { ramoAtividadeCodigo: null },
      ],
    });
  }

  return db.entities.taxaContratual
    .findOne(query)
    .then(result => result.antecipacao);
};
