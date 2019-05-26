import dataFaker from '../../dataFaker';

const credenciamentoTaxaAdministrativaFactory = (factory) => {
  return factory.define('credenciamentoTaxaAdministrativa', {
    valor: dataFaker.floating({ min: 0, max: 10, fixed: 2 }),
  });
};

export default credenciamentoTaxaAdministrativaFactory;
