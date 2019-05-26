import dataFaker from '../../dataFaker';

const exportacaoFactory = (factory) => {
  return factory.define('exportacao', {
    id: dataFaker.integer(),
    arquivo: dataFaker.string({ length: 50 }),
    titulo: dataFaker.string({ length: 50 }),
    descricao: dataFaker.string({ length: 250 }),
    ativo: dataFaker.bool(),
  });
};

export default exportacaoFactory;
