import usuarioStatus from '../../entities/usuarioStatus';

const listInvitesUseCase = db => (participanteId, status) => {
  function getConvites() {
    let expiraEm;

    if (status === usuarioStatus.expirado) {
      expiraEm = { $lte: new Date() };
    } else {
      expiraEm = { $gt: new Date() };
    }

    const where: any = {
      expiraEm,
    };

    if (participanteId) {
      where.participante = participanteId;
    }

    return db.entities.usuarioConvite.findAll({
      where,
      attributes: ['nome', 'email', 'celular', 'roles', 'expiraEm'],
    });
  }

  function mapResult(invites) {
    return invites.map(invite => ({
      nome: invite.nome,
      email: invite.email,
      celular: invite.celular,
      roles: invite.roles,
      expiraEm: invite.expiraEm,
      status: invite.status,
    }));
  }

  return getConvites().then(mapResult);
};

export default listInvitesUseCase;
