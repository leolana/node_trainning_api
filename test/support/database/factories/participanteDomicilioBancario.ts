import dataFaker from '../../dataFaker';

const participanteDomicilioBancarioFactory = (factory) => {
  return factory.define('participanteDomicilioBancario', {
    participanteId: dataFaker.integer(),
    bandeiraId: dataFaker.integer(),
    bancoId: dataFaker.string({ length: 3, pool: '0123456798' }),
    bancoNome: dataFaker.name(),
    agencia: dataFaker.string({ length: 5, pool: '0123456798' }),
    conta: dataFaker.string({ length: 10, pool: '0123456798' }),
    digito: dataFaker.string({ length: 1, pool: '0123456798' })
  });
};

export default participanteDomicilioBancarioFactory;
