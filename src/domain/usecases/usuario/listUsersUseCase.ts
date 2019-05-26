
import usuarioStatus from '../../entities/usuarioStatus';
import { setDatatableOptionsService } from '../../../domain/services/datatable/setDatatableOptionsService';

const listUsersUseCase = db => (participanteId, filter, datatableOptions) => {
  function getUsuarios() {
    const where: any = {};
    let whereParticipante = null;

    if (filter.nomeParticipante) {
      whereParticipante = {
        nome: { $iLike: `%${filter.nomeParticipante}%` }
      };
    }

    if (participanteId) {
      where.participanteId = participanteId;
    }

    if (datatableOptions.sortColumn === 'perfis') {
      datatableOptions.sortColumn = 'roles';
    }

    const config = {
      attributes: ['id', 'nome', 'email', 'celular', 'roles', 'ativo'],
      include: [{
        where,
        model: db.entities.membro,
        as: 'associacoes',
        include: [{
          model: db.entities.participante,
          as: 'participante',
          where: whereParticipante,
        }]
      }],
      where: { ativo: usuarioStatus.ativo === filter.status },
    };
    const usersLength = db.entities.usuario.findAll(config);
    if (!isNaN(datatableOptions.pageSize) && !isNaN(datatableOptions.pageIndex)) {
      setDatatableOptionsService(datatableOptions, config);
    }
    const users = db.entities.usuario.findAll(config);

    return Promise.all([usersLength, users]);
  }

  function mapResult(users) {
    const usersLength = users[0].length;
    const arrayUsers = users[1].map(user => ({
      id: user.id,
      nome: user.nome,
      email: user.email,
      celular: user.celular,
      roles: user.roles,
      ativo: user.ativo,
    }));

    return { usersLength, users: arrayUsers };
  }

  return getUsuarios().then(mapResult);
};

export default listUsersUseCase;
