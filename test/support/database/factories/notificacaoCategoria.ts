import dataFaker from '../../dataFaker';
const notificacaoCategoriaFactory = (factory) => {
  return factory.define('notificacaoCategoria', {
    categoria: dataFaker.name(),
    ativo: true
  });
};

export default notificacaoCategoriaFactory;
