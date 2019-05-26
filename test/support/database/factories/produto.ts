import dataFaker from '../../dataFaker';

const produtoFactory = (factory) => {
  return factory.define('produto', {
    nome: dataFaker.name(),
    descricao: dataFaker.string({ length: 250 }),
    usuario: dataFaker.string({ length: 100 }),
    ativo: dataFaker.bool()

  });
};

export default produtoFactory;
