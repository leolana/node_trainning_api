import dataFaker from '../../dataFaker';

const motivoRecusaFactory = (factory) => {
  return factory.define('motivoRecusa', {
    codigo: dataFaker.string({ length: 20 }),
    descricao: dataFaker.string({ length: 100 }),
    requerObservacao: dataFaker.bool(),
    ativo: dataFaker.bool(),
  });
};

export default motivoRecusaFactory;
