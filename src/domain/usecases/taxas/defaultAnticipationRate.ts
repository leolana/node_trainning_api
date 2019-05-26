import * as sequelize from 'sequelize';

const defaultAnticipationRate = db => (personType, branchType) => {
  const query: any = {
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

export default defaultAnticipationRate;
