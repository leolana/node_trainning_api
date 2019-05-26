import providerEnum from '../../services/eventos/providerEnum';
import establishmentEnum from '../../services/eventos/establishmentEnum';

const getProductsDropdown = db => (ehEstabelecimento, ehFornecedor) => {
  let eventoIds = [];

  if (ehEstabelecimento) {
    eventoIds = Object.values(establishmentEnum);
  }
  if (ehFornecedor) {
    eventoIds = Object.values(providerEnum);
  }

  return db.entities.evento.findAll({ where: { id: eventoIds } });
};

export default getProductsDropdown;
