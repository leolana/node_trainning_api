import dataFaker from '../../dataFaker';

const participanteVinculoRecorrenteFactory = (factory) => {
  return factory.define('participanteVinculoRecorrente', {
    participanteVinculoId: dataFaker.integer(),
    usuario: dataFaker.string({ length: 100 }),
    status: dataFaker.integer(),
    valorMaximo: dataFaker.floating({ fixed: 2 }),
    dataFinalVigencia: dataFaker.date(),
    usuarioAprovadorEstabelecimento: dataFaker.string({ length: 100 }),
    dataAprovacaoEstabelecimento: dataFaker.date(),
  });
};

export default participanteVinculoRecorrenteFactory;
