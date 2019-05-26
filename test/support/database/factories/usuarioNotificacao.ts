const usuarioNotificacaoFactory = (factory) => {
  return factory.define('usuarioNotificacao', {
    notificacaoId: 1,
    usuarioId: '00000000-0000-0000-0000-000000000000',
    status: 2,
  });
};

export default usuarioNotificacaoFactory;
