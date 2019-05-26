import dataFaker from '../../dataFaker';

const cidadeFactory = (factory) => {
  return factory.define('cidade', {
    id: dataFaker.integer(),
    nome: dataFaker.string({ length: 100 }),
    estado: dataFaker.string({ length: 2 }),
  });
};

export default cidadeFactory;
