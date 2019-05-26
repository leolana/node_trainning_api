const sequelize = require('sequelize');

module.exports = db => (
  idTipoPessoa,
  idRamoAtividade,
  inicioVigencia,
  terminoVigencia,
) => {
  const where = {};

  if (idTipoPessoa) {
    where.tipoPessoa = idTipoPessoa;
  }
  if (idRamoAtividade) {
    where.ramoAtividadeCodigo = idRamoAtividade;
  }
  if (inicioVigencia) {
    where.inicio = {
      [sequelize.Op.gte]: inicioVigencia,
    };
  }
  if (terminoVigencia) {
    where.fim = {
      [sequelize.Op.lt]: new Date(
        terminoVigencia.getFullYear(),
        terminoVigencia.getMonth(),
        terminoVigencia.getDate() + 1,
      ),
    };
  }

  return db.entities.taxa
    .findAll({
      where,
      include: [
        {
          model: db.entities.ramoAtividade,
          as: 'ramoAtividade',
        },
      ],
    })
    .then(taxas => {
      taxas = taxas.map(taxa => ({
        id: taxa.id,
        idTipoPessoa: taxa.tipoPessoa,
        ramoAtividade: (taxa.ramoAtividade || { descricao: 'Todos' }).descricao,
        inicioVigencia: taxa.inicio,
        terminoVigencia: taxa.fim,
      }));
      return taxas;
    });
};
