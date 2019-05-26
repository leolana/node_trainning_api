module.exports = db => (inviteId) => {
  const find = inviteId => db.entities.usuarioConvite.findOne({
    where: {
      codigo: inviteId,
    },
  });

  const validateDestroy = (invite) => {
    if (!invite) throw String('invite-not-found');
    return invite.destroy();
  };

  return find(inviteId)
    .then(validateDestroy);
};
