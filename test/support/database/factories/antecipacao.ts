import dataFaker from '../../dataFaker';

const antecipacaoFactory = (factory) => {
  return factory.define('antecipacao', {
    participanteId: dataFaker.integer(),
    usuario: dataFaker.string({ length: 100 }),
    dataPagamento: dataFaker.date(),
    status: dataFaker.integer(),
  });
};

export default antecipacaoFactory;
