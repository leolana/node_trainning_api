import { Sequelize } from 'sequelize-database';
import { DateTime } from 'luxon';

const checkMembershipsUseCase = (db: Sequelize) => async (emails: string[]) => {
  const users = await db.entities.usuario.findAll({
    where: { email: emails },
    attributes: ['id', 'email', 'roles'],
    include: [
      {
        model: db.entities.membro,
        attributes: ['participanteId'],
        as: 'associacoes',
        include: [
          {
            model: db.entities.participante,
            as: 'participante',
            attributes: ['id', 'nome'],
          },
        ],
      },
    ],
  });

  const today = DateTime.local().toSQLDate();

  const convites = await db.entities.usuarioConvite.findAll({
    attributes: ['email', 'roles'],
    where: {
      email: emails,
      expiraEm: { $gte: today }
    },
  });

  const memberships = users.map((user) => {
    return user.associacoes.map(membro => ({
      ...membro.participante.dataValues,
      email: user.email,
      userId: user.id,
      memberId: membro.participanteId,
      roles: user.roles,
    }));
  });

  return {
    convites, memberships
  };

};

export default checkMembershipsUseCase;
