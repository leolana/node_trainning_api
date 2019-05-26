import dataFaker from '../../dataFaker';

const participanteVinculoHistoricoFactory = (factory) => {
  return factory.define('participanteVinculoHistorico', {
    participanteEstabelecimentoId: dataFaker.integer(),
    participanteFornecedorId: dataFaker.integer(),
    usuario: dataFaker.string({ length: 100 }),
    status: dataFaker.integer(),
    exibeValorDisponivel: dataFaker.bool(),
    diasAprovacao: dataFaker.integer(),
    dataRespostaEstabelecimento: dataFaker.date(),
    usuarioRespostaEstabelecimento: dataFaker.string({ length: 100 }),
    valorMaximoExibicao: dataFaker.floating({ min: 1, max: 10000, fixed: 2 }),
  });
};

export default participanteVinculoHistoricoFactory;
