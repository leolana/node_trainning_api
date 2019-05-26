import { Sequelize } from 'sequelize-database';

const getNotificationUseCase = (db: Sequelize) => (page, limit, userObj) => {

  const findUser = user => db.entities.usuario.findOne({
    attributes: ['id'],
    where: { email: user.email }
  });

  const find = (userID) => {
    if (!userID) return null;
    return db.entities.notificacao
      .findAll({
        limit,
        order: [['createdAt', 'DESC']],
        offset: page,
        include: [
          {
            model: db.entities.notificacaoCategoria,
            where: { ativo: true },
          },
          {
            model: db.entities.usuarioNotificacao,
            where: { usuarioId: userID.id },
            as: 'usuarioNotificacao'
          },
        ]
      });
  };

  return findUser(userObj)
    .then(find);

};

export default getNotificationUseCase;
