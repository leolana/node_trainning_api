import dataFaker from '../../dataFaker';
import { DateTime } from 'luxon';
const notificacaoFactory = (factory) => {
  return factory.define('notificacao', {
    categoriaId: 1,
    criadorId: '00000000-0000-0000-0000-000000000000',
    mensagem: 'Alguém integrou-se',
    dataExpiracao: DateTime.local().plus({ days: 5 }),
    usuarioNotificacao: {
      notificacaoId: 1,
      usuarioId: '00000000-0000-0000-0000-000000000000',
      status: 2,
    },
    notificacaoCategoria: {
      categoria: dataFaker.name(),
      ativo: true
    }
  });
};

export default notificacaoFactory;
