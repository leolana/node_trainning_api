import dataFaker from '../../dataFaker';

const capturaFactory = (factory) => {
  return factory.define('captura', {
    cessaoId: dataFaker.integer(),
    usuario: dataFaker.string({ length: 100 }),
    status: dataFaker.integer(),
    termoId: dataFaker.integer(),
    mensagemSiscof: dataFaker.string({ length: 500 }),
    codRetornoSiscof: dataFaker.integer(),
  });
};

export default capturaFactory;
