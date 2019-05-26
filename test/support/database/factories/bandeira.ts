import dataFaker from '../../dataFaker';

const bandeiraFactory = (factory) => {
  return factory.define('bandeira', {
    nome: dataFaker.string({ length: 100 }),
    ativo: dataFaker.bool(),
  });
};

export default bandeiraFactory;
