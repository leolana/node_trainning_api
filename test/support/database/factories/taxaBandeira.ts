import dataFaker from '../../dataFaker';

const taxaBandeiraFactory = (factory) => {
  return factory.define('taxaBandeira', {
    taxaDebito: dataFaker.floating({ fixed: 2 }),
    usuario: dataFaker.string({ length: 100 }),

  });
};

export default taxaBandeiraFactory;
