const sequelize = require('sequelize');

module.exports = db => taxa => {
  const conditions = [
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
