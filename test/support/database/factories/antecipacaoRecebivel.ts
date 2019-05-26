import dataFaker from '../../dataFaker';

const antecipacaoRecebivelFactory = (factory) => {
  return factory.define('antecipacaoRecebivel', {
    antecipacaoId: dataFaker.integer(),
    dataPagamento: dataFaker.date(),
    diasAntecipacao: dataFaker.integer(),
    valorPagar: dataFaker.floating({ min: 0, max: 100, fixed: 2 }),
    taxaAntecipacao: dataFaker.floating({ min: 0, max: 2, fixed: 2 }),
    descontoAntecipacao: dataFaker.floating({ min: 0, max: 10, fixed: 2 }),
    valorAntecipado: dataFaker.floating({ min: 0, max: 100, fixed: 2 }),
    rowId: dataFaker.string({ length: 30 }),
    bandeiraId: dataFaker.integer(),
    eventoId: dataFaker.integer(),
  });
};

export default antecipacaoRecebivelFactory;
