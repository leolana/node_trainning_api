module.exports = db => (id, transaction) => {
  const cidadeInclude = () => ({
    model: db.entities.cidade,
    as: 'cidade',
    attributes: ['id', 'nome', 'estado'],
  });

  return db.entities.credenciamento
    .findOne({
      where: { id },
      include: [
        cidadeInclude(),
        {
          model: db.entities.credenciamentoDomicilioBancario,
          as: 'domiciliosBancarios',
        },
        {
          model: db.entities.credenciamentoSocio,
          as: 'socios',
        },
        {
          model: db.entities.credenciamentoContato,
          as: 'contato',
        },
        {
          model: db.entities.credenciamentoInstalacao,
          as: 'instalacao',
          include: [cidadeInclude()],
        },
        {
          model: db.entities.credenciamentoCaptura,
          as: 'capturas',
          attributes: ['quantidade'],
          include: [{
            model: db.entities.captura,
            as: 'captura',
            attributes: ['tipoCaptura', 'valor'],
            include: [{
              model: db.entities.produto,
              as: 'produto',
              attributes: ['nome'],
            }],
          }],
        },
        {
          model: db.entities.taxaContratual,
          as: 'taxaContratual',
          attributes: ['id', 'antecipacao'],
        },
        {
          model: db.entities.credenciamentoTaxaAdministrativa,
          as: 'taxasAdministrativas',
          attributes: ['id', 'valor'],
          include: [{
            model: db.entities.taxaAdministrativa,
            as: 'taxaAdministrativa',
            attributes: ['id', 'bandeiraId'],
            include: [{
              model: db.entities.taxaPrazo,
              as: 'taxaPrazo',
              attributes: ['id', 'prazo', 'minimo', 'maximo', 'eventoId'],
            }],
          }],
        },
        {
          model: db.entities.credenciamentoTaxaDebito,
          as: 'taxasDebito',
          attributes: ['id', 'valor'],
          include: [{
            model: db.entities.taxaBandeira,
            as: 'taxaBandeira',
            attributes: ['id', 'bandeiraId'],
          }],
        },
      ],
      transaction,
    });
};
