import dataFaker from '../../dataFaker';

const participanteIntegracaoFactory = (factory) => {
  return factory.define('participanteIntegracao', {
    id: dataFaker.guid(),
    participanteId: dataFaker.integer(),
    tipoIntegracao: dataFaker.integer(),
    status: dataFaker.integer(),
    usuario: dataFaker.email()
  });
};

export default participanteIntegracaoFactory;
