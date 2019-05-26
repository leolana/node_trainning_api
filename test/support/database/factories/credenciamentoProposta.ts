import dataFaker from '../../dataFaker';

const credenciamentoPropostaFactory = (factory) => {
  return factory.define('credenciamentoProposta', {
    tipoPessoa: dataFaker.integer(),
    documento: dataFaker.string({ length: 18 }),
    nome: dataFaker.string({ length: 100 }),
    arquivos: null,
    participanteId: dataFaker.integer(),
    usuario: dataFaker.string({ length: 100 }),
  });
};

export default credenciamentoPropostaFactory;
