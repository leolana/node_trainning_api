import { Sequelize } from 'sequelize-database';

export interface ConviteDoParticipante {
  nome: string;
  email: string;
  celular: string;
  perfis: string[];
  expiraEm: Date;
}

const listInvitesFromParticipantUseCase = (db: Sequelize) =>
  async (idParticipante: number): Promise<ConviteDoParticipante[]> => {
    const convites = await db.entities.usuarioConvite.findAll({
      where: {
        participante: idParticipante,
      },
      attributes: ['nome', 'email', 'celular', ['roles', 'perfis'], 'expiraEm'],
    });

    convites.forEach((convite) => {
      convite.dataValues.status = new Date(convite.expiraEm) < new Date() ? 'Expirado' : 'Pendente';
    });

    return convites;
  };

export default listInvitesFromParticipantUseCase;
