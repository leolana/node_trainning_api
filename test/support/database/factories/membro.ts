import dataFaker from '../../dataFaker';

const membroFactory = (factory) => {
  return factory.define('membro', {
    participanteId: dataFaker.integer(),
    usuarioId: dataFaker.guid(),
  });
};

export default membroFactory;
