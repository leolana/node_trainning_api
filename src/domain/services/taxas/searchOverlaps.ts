import * as sequelize from 'sequelize';

const searchOverlaps = db => (taxa: any) => {
  const conditions: any = [
    { tipoPessoa: taxa.tipoPessoa },
    { ramoAtividadeCodigo: taxa.ramoAtividadeCodigo },
    sequelize.or({ fim: null }, { fim: { [sequelize.Op.gte]: taxa.inicio } }),
  ];

  if (taxa.fim) {
    conditions.push({
      inicio: { [sequelize.Op.lte]: taxa.fim },
    });
  }

  return db.entities.taxa.findAll({ where: sequelize.and(...conditions) });
};

export default searchOverlaps;
