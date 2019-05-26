import dataFaker from '../../dataFaker';

const taxaAdministrativaFactory = (factory) => {
  return factory.define('taxaAdministrativa', {
    valorBase: dataFaker.floating({ fixed: 2 }),
    usuario: dataFaker.string({ length: 100 }),

  });
};

export default taxaAdministrativaFactory;
