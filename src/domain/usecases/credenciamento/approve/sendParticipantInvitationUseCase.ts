import { Auth } from '../../../../infra/auth';
import { Transaction } from 'sequelize';
import rolesEnum from '../../../services/auth/rolesEnum';

const sendParticipantInvitationUseCase = (
  auth: Auth
) =>

  /**
   * Envia convite para o usuário do credenciamento aprovado
   * para poder se vincular ao participante.
   */
  async (
    participanteId: number,
    participanteNome: string,
    participanteEmail: string,
    participanteCelular: string,
    userEmail: string,
    transaction: Transaction
  ) => {

    const invite = {
      nome: participanteNome,
      email: participanteEmail,
      celular: participanteCelular,
      roles: [rolesEnum.ecAdministrador],
      convidadoPor: userEmail,
      participante: participanteId,
    };

    await auth.inviteUser(invite, transaction);
  };

export default sendParticipantInvitationUseCase;
