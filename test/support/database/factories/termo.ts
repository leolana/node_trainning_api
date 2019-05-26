import dataFaker from '../../dataFaker';

const termoFactory = (factory) => {
  return factory.define('termo', {
    titulo: dataFaker.string({ length: 100 }),
    tipo: dataFaker.integer(),
    usuario: dataFaker.string({ length: 100 }),
    texto: dataFaker.string(),
    inicio: dataFaker.date(),
    fim: dataFaker.date(),
  });
};

export default termoFactory;
