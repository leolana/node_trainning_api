import anticipationRealizedEnum from '../../services/eventos/anticipationRealizedEnum';

const getProductsDropdownRealized = db => () => {
  return db.entities.evento.findAll({ where: { id: Object.values(anticipationRealizedEnum) } });
};

export default getProductsDropdownRealized;
