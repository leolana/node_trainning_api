import dataFaker from '../../dataFaker';

const motivoTipoRecusaFactory = (factory) => {
  return factory.define('motivoTipoRecusa', {
    motivoRecusaId: dataFaker.integer(),
    recusaTipoId: dataFaker.integer(),
  });
};

export default motivoTipoRecusaFactory;
