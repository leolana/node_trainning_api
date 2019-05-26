import dataFaker from '../../dataFaker';

const participanteTaxaHistoricoFactory = (factory) => {
  return factory.define('participanteTaxaHistorico', {
    participanteTaxaId: dataFaker.integer(),
    valorInicio: dataFaker.floating({ fixed: 2 }),
    valorFim: dataFaker.floating({ fixed: 2 }),
    taxa: dataFaker.floating({ min: 0, max: 100, fixed: 2 }),
    participanteId: dataFaker.integer(),
    usuarioCriacao: dataFaker.string(),
    dataInclusao: dataFaker.date(),
    participanteTaxaTipo: dataFaker.integer({ min: 1, max: 2 }),
  });
};

export default participanteTaxaHistoricoFactory;
