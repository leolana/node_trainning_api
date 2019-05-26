const providerEvents = require('../../service/eventos/provider.enum');
const establishmentEvents = require('../../service/eventos/establishment.enum');

module.exports = db => (ehEstabelecimento, ehFornecedor) => {
  let eventoIds = [];

  if (ehEstabelecimento) {
    eventoIds = Object.values(establishmentEvents);
  }
  if (ehFornecedor) {
    eventoIds = Object.values(providerEvents);
  }

  return db.entities.evento.findAll({ where: { id: eventoIds } });
};
