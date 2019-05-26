import usuarioStatus from '../../entities/usuarioStatus';

const listUsersUseCase = db => (participanteId, status) => {
  function getUsuarios() {
    const where: any = {};

    if (participanteId) {
      where.participanteId = participanteId;
    }

    return db.entities.usuario.findAll({
      attributes: ['id', 'nome', 'email', 'celular', 'roles', 'ativo'],
      include: [{
        where,
        model: db.entities.membro,
        as: 'associacoes',
      }],
      where: { ativo: usuarioStatus.ativo === status },
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

export default listUsersUseCase;
