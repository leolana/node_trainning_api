import dataFaker from '../../dataFaker';

const participanteEstabelecimentoFactory = (factory) => {
  return factory.define('participanteEstabelecimento', {
    participanteId: dataFaker.integer()
  });
};

export default participanteEstabelecimentoFactory;
