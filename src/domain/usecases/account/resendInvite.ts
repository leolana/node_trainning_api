import { paramsEnum as accountParams } from '../../services/account/paramsEnum';

const resendInvite = (db, mailer, emailTemplates, settings) => (
  userEmail
) => {
  const findInvite = () => {
    const where = { email: userEmail };

    const checkInvite = (invite) => {
      if (!invite) {
        throw new Error('invite-not-found');
      }
      return invite;
    };

    return db.entities.usuarioConvite
      .findOne({ where })
      .then(checkInvite);
  };

  const updateExpirationDate = (invite) => {
    const now = new Date();
    invite.expiraEm = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + accountParams.prazoExpiracaoConviteEmDias
    );
    return invite.save();
  };

  const sendInvite = (invite) => {
    const inviteConfig = {
      templateName: emailTemplates.DEFINIR_SENHA,
      destinatary: invite.email,
      substitutions: {
        loginAcesso: invite.email,
        linkRedefinirSenha: `${settings.baseUrl}/registrar/`
          + `${invite.email}/${invite.codigo}`,
      },
    };
    return mailer.enviar(inviteConfig);
  };

  return findInvite()
    .then(updateExpirationDate)
    .then(sendInvite);
};

export default resendInvite;
