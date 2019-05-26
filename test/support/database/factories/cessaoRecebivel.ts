import dataFaker from '../../dataFaker';

const cessaoRecebivelFactory = (factory) => {
  return factory.define('cessaoRecebivel', {
    cessaoId: dataFaker.integer(),
    eventoId: dataFaker.integer(),
    dataVenda: dataFaker.date(),
    valorVenda: dataFaker.floating({ min: 0, max: 100, fixed: 2 }),
    dataReserva: dataFaker.date(),
    dataPagarEc: dataFaker.date(),
    valorPagarEc: dataFaker.floating({ min: 0, max: 100, fixed: 2 }),
    nsu: dataFaker.string({ length: 30 }),
    numeroParcela: dataFaker.integer(),
    totalParcelas: dataFaker.integer(),
    statusPagamento: dataFaker.integer(),
  });
};

export default cessaoRecebivelFactory;
