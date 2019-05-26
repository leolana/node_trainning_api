import { Sequelize } from 'sequelize-database';

export interface UsuarioDoParticipante {
  id: number;
  nome: string;
  email: string;
  celular: string;
  perfis: string[];
  ativo: boolean;
}

const listUsersFromParticipantUseCase = (db: Sequelize) => async (idParticipante: number) => {
  const membros = await db.entities.membro.findAll({
    where: {
      participanteId: idParticipante,
    },
    attributes: [],
    include: [{
      model: db.entities.usuario,
      as: 'usuario',
      attributes: ['id', 'nome', 'email', 'celular', ['roles', 'perfis'], 'ativo'],
    }],
  });

  const usuarios = <UsuarioDoParticipante[]>membros.map(membro => membro.usuario);

  return usuarios;
};

export default listUsersFromParticipantUseCase;
