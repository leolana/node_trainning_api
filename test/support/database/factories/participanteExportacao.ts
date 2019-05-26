import dataFaker from '../../dataFaker';

const participanteExportacaoFactory = (factory) => {
  return factory.define('participanteExportacao', {
    exportacaoId: dataFaker.integer(),
    participanteId: dataFaker.integer(),
  });
};

export default participanteExportacaoFactory;
