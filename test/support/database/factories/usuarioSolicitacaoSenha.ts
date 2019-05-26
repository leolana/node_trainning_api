import dataFaker from '../../dataFaker';

const usuarioSolicitacaoSenhaFactory = (factory) => {
  return factory.define('usuarioSolicitacaoSenha', {
    codigo:'00000000-0000-0000-0000-000000000000',
    email: dataFaker.email(),
    expiraEm: dataFaker.date(),
  });
};

export default usuarioSolicitacaoSenhaFactory;
