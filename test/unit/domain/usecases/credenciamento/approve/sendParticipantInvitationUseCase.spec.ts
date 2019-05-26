// tslint:disable:no-magic-numbers
import sendParticipantInvitationUseCase from '../../../../../../src/domain/usecases/credenciamento/approve/sendParticipantInvitationUseCase';
import rolesEnum from '../../../../../../src/domain/services/auth/rolesEnum';

describe('Domain :: UseCases :: Credenciamento :: Approve :: sendParticipantInvitationUseCase', () => {

  test(
    `
      Should call (auth.inviteUser) with correct values and [role]
    `,
    async (done) => {
      try {

        const participanteId = 1;
        const participanteNome = 'Padaria Flora';
        const participanteEmail = 'padaria_flora@gmail.com';
        const participanteCelular = '11912344321';
        const userEmail = 'alpe@alpe.com.br';
        const transaction: any = {};

        const auth: any = {
          inviteUser: async (invite: any, postgresTransaction: any) => {
            expect(postgresTransaction).toBe(transaction);

            expect(invite.nome).toBe(participanteNome);
            expect(invite.email).toBe(participanteEmail);
            expect(invite.celular).toBe(participanteCelular);
            expect(invite.convidadoPor).toBe(userEmail);
            expect(invite.participante).toBe(participanteId);

            expect(Array.isArray(invite.roles)).toBe(true);
            expect(invite.roles.length).toBe(1);
            expect(invite.roles[0]).toBe(rolesEnum.ecAdministrador);
          }
        };

        const sendParticipantInvitation = sendParticipantInvitationUseCase(
          auth
        );

        await sendParticipantInvitation(
          participanteId,
          participanteNome,
          participanteEmail,
          participanteCelular,
          userEmail,
          transaction
        );

      } catch (error) {
        expect(error).toBe(null);
      }

      done();
    }
  );

});
