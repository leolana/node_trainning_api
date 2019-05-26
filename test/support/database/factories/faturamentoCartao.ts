import dataFaker from '../../dataFaker';

const faturamentoCartaoFactory = (factory) => {
  return factory.define('faturamentoCartao', {
    descricao: dataFaker.string({ length: 200 }),
    ativo: dataFaker.bool(),
  });
};

export default faturamentoCartaoFactory;
