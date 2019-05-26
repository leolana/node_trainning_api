import dataFaker from '../../dataFaker';

const indicacaoFornecedorFalhaFactory = (factory) => {
  return factory.define('indicacaoFornecedorFalha', {
    participanteId: dataFaker.integer(),
    documento: dataFaker.string({ length: 15 }),
    usuario: dataFaker.string({ length: 100 }),
  });
};

export default indicacaoFornecedorFalhaFactory;
