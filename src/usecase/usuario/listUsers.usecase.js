const userStatus = require('./status.enum');

module.exports = db => (participanteId, status) => {
  function getUsuarios() {
    const where = {};

    if (participanteId) {
      where.participanteId = participanteId;
    }

    return db.entities.usuario.findAll({
      attributes: ['id', 'nome', 'email', 'celular', 'roles', 'ativo'],
      include: [{
        model: db.entities.membro,
        as: 'associacoes',
        where,
      }],
      where: { ativo: userStatus.ativo === status },
    });
  }

  function mapResult(users) {
    return users.map(user => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      celular: user.celular,
      roles: user.roles,
      ativo: user.ativo,
    }));
  }

  return getUsuarios().then(mapResult);
};
