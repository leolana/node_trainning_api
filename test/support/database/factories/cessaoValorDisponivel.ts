import dataFaker from '../../dataFaker';

const cessaoValorDisponivelFactory = (factory) => {
  return factory.define('cessaoValorDisponivel', {
    participanteVinculoId: dataFaker.integer(),
    dataConsulta: dataFaker.date(),
    valorDisponivel: dataFaker.floating({ min: 0, max: 100, fixed: 2 }),
    usuario: dataFaker.string({ length: 100 }),
  });
};

export default cessaoValorDisponivelFactory;
