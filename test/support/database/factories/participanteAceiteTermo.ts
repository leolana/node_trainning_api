import dataFaker from '../../dataFaker';

const participanteAceiteTermoFactory = (factory) => {
  return factory.define('participanteAceiteTermo', {
    participanteId: dataFaker.integer(),
    termoId: dataFaker.integer(),
    usuario: dataFaker.name(),
  });
};

export default participanteAceiteTermoFactory;
