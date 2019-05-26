import dataFaker from '../../dataFaker';

const ticketMedioFactory = (factory) => {
  return factory.define('ticketMedio', {
    descricao: dataFaker.string({ length: 200 }),
  });
};

export default ticketMedioFactory;
