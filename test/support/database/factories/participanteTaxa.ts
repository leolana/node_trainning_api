import dataFaker from '../../dataFaker';

const participanteTaxaFactory = (factory) => {
  return factory.define('participanteTaxa', {
    valorInicio: dataFaker.floating({ fixed: 2 }),
    valorFim: dataFaker.floating({ fixed: 2 }),
    taxa: dataFaker.floating({ min: 0, max: 100, fixed: 2 }),
    participanteId: dataFaker.integer(),
    usuarioCriacao: dataFaker.string(),
    participanteTaxaTipo: dataFaker.integer({ min: 1, max: 2 }),
  });
};

export default participanteTaxaFactory;
