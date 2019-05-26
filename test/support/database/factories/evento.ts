import dataFaker from '../../dataFaker';

const eventoFactory = (factory) => {
  return factory.define('evento', {
    nome: dataFaker.string({ length: 100 }),
  });
};

export default eventoFactory;
