import usuarioStatus from '../../entities/usuarioStatus';
import { setDatatableOptionsService } from '../../../domain/services/datatable/setDatatableOptionsService';

const listInvitesUseCase = db => (participanteId, filter, datatableOptions) => {
  function searchParticipante() {
    if (filter.nomeParticipante) {
      return db.entities.participante.findAll({
        attributes: ['id'],
        where: {
          nome: { $iLike: `%${filter.nomeParticipante}%` }
        }
      });
    }
    return Promise.resolve();
  }

  function getConvites(filterParticipante) {
    let expiraEm;

    if (filter.status === usuarioStatus.expirado) {
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

    if (filterParticipante) {
      const ids = filterParticipante.map(p => (p.id));
      where.participante = { $in: ids };
    }

    if (datatableOptions.sortColumn === 'perfis') datatableOptions.sortColumn = 'roles';

    const invitesLength = db.entities.usuarioConvite.count({ where });

    const config = {
      where,
      attributes: ['nome', 'email', 'celular', 'roles', 'expiraEm'],
    };

    if (!isNaN(datatableOptions.pageSize) && !isNaN(datatableOptions.pageIndex)) {
      setDatatableOptionsService(datatableOptions, config);
    }

    const invites = db.entities.usuarioConvite.findAll(config);
    return Promise.all([invitesLength, invites]);
  }

  function mapResult(invites) {

    const arrayInvites = invites[1].map(invite => ({
      nome: invite.nome,
      email: invite.email,
      celular: invite.celular,
      roles: invite.roles,
      expiraEm: invite.expiraEm,
      status: invite.status,
    }));

    return { invitesLength: invites[0], invites: arrayInvites };
  }

  return searchParticipante()
    .then(getConvites)
    .then(mapResult);
};

export default listInvitesUseCase;
