import dataFaker from '../../dataFaker';

const ramoAtividadeFactory = (factory) => {
  return factory.define('ramoAtividade', {
    codigo: dataFaker.integer(),
    descricao: dataFaker.string({ length: 100 }),
    restritoPJ: dataFaker.bool(),
    ativo: dataFaker.bool()

  });
};

export default ramoAtividadeFactory;
