import dataFaker from '../../dataFaker';

const cessaoFactory = (factory) => {
  return factory.define('cessao', {
    participanteVinculoId: dataFaker.integer(),
    solicitante: dataFaker.string({ length: 100 }),
    usuario: dataFaker.string({ length: 100 }),
    status: dataFaker.integer(),
    valorSolicitado: dataFaker.floating({ min: 0, max: 100, fixed: 2 }),
    valorDisponivel: dataFaker.floating({ min: 0, max: 100, fixed: 2 }),
    dataVencimento: dataFaker.date(),
    dataExpiracao: dataFaker.date(),
    codigoCessao: dataFaker.integer(),
    referencia: dataFaker.string({ length: 30 }),
    codigoRetornoSiscof: dataFaker.integer(),
    mensagemRetornoSiscof: dataFaker.string({ length: 500 }),
    taxaCessao: dataFaker.floating({ min: 0, max: 2, fixed: 2 }),
    fornecedorAceiteTermoId: dataFaker.integer(),
    estabelecimentoAceiteTermoId: dataFaker.integer(),
    dataRespostaEstabelecimento: dataFaker.date(),
    usuarioRespostaEstabelecimento: dataFaker.string({ length: 100 }),
    numeroParcelas: dataFaker.integer(),
    tipo: dataFaker.integer(),
    diluicaoPagamento: dataFaker.integer(),
  });
};

export default cessaoFactory;
