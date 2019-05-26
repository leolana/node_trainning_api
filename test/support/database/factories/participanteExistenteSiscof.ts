import dataFaker from '../../dataFaker';

const participanteExistenteSiscofFactory = (factory) => {
  return factory.define('participanteExistenteSiscof', {
    participanteId: dataFaker.integer(),
    documento: dataFaker.string({ length: 15, pool: '0123456789' }),
  });
};

export default participanteExistenteSiscofFactory;
