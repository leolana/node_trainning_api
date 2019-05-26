import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { Sequelize } from 'sequelize-database';
import usuarioNotificacaoEnum from '../../../domain/services/notificacoes/usuarioNotificacaoEnum';
import { getTipoDocumento, getSiglaParticipante } from '../../../domain/services/participante/personTypeEnum';

const addNotificationUseCase = (db: Sequelize) => async (
  data: any,
  role: string[],
  userEmail: string,
  participanteId?: number
) => {
  if (!participanteId && !data.mensagem) {
    throw new Exceptions.ParticipanteNotFoundException();
  }

  if (!userEmail) {
    throw new Exceptions.UserNotFoundException();
  }

  if (participanteId) {
    const participante = await db.entities.participante
      .findOne({ where: { id: participanteId } });

    if (!participante) {
      throw new Exceptions.ParticipanteNotFoundException();
    }

    const ehFornecedor = await db.entities.participanteFornecedor
      .findOne({ where: { participanteId } });
    const tipoDocumento = getTipoDocumento(participante.documento);

    const tipoParticipante = ehFornecedor ? 'Fornecedor' : 'Estabelecimento';
    const tipoSigla = getSiglaParticipante(ehFornecedor);

    data.mensagem = `O ${tipoParticipante} ${participante.nome} (${tipoSigla}: ${participanteId} /
     ${tipoDocumento}: ${participante.documento}) integrou-se.`;
  }

  const usuarios = await db.entities.usuario.findAll({
    attributes: ['id', 'email'],
    where: { roles: { $overlap: role }, ativo: true }
  },
  );

  if (!usuarios.length) {
    throw new Exceptions.UserNotFoundException();
  }

  const criador = usuarios.find(u => u.email === userEmail);

  const notifications = usuarios.map(u => ({
    ...data,
    criadorId: criador.id,
    usuarioNotificacao: {
      status: u.email === userEmail ? usuarioNotificacaoEnum.lido : usuarioNotificacaoEnum.naoLido,
      usuarioId: u.id,
    }
  }));

  const notificacaoCategoria = await db.entities.notificacaoCategoria.findOne({
    where: { id: data.categoriaId },
  });

  if (!notificacaoCategoria) {
    throw new Exceptions.NotificationCategoryNotFoundException();
  }

  const promises = notifications.map((n) => {
    return db.entities.notificacao.create(n, {
      include: [
        {
          model: db.entities.usuarioNotificacao,
          as: 'usuarioNotificacao',
        }
      ],
    });
  });
  await Promise.all(promises);

};

export default addNotificationUseCase;
