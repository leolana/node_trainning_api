import { DateTime } from 'luxon';

import termoTypeEnum from '../../services/termo/termoTypeEnum';
import participanteIndicacaoStatus from '../../entities/participanteIndicacaoStatus';
import { vinculoConfig } from '../../services/vinculo/vinculoConfig';
import participanteVinculoStatus from '../../entities/participanteVinculoStatus';
import { rolesEnum as roles } from '../../services/auth/rolesEnum';
import { Auth } from '../../../infra/auth';
import { Sequelize } from 'sequelize-database';
import { CredenciamentoServices } from '../../services/credenciamento';

const now = DateTime.local();

const effectiveDate = {
  inicio: { $lte: now.toSQLDate() },
  fim: {
    $or: {
      $eq: null,
      $gte: now.toSQLDate(),
    },
  },
};

const approveUseCase = (
  db: Sequelize,
  auth: Auth,
  services: CredenciamentoServices
) => (id: number, user: string) => {
  let participantId = null;

  const findTerm = () => db.entities.termo.findOne({
    where: {
      ...effectiveDate,
      tipo: termoTypeEnum.contratoMaeEstabelecimento,
    },
    attributes: ['id'],
  });

  const acceptTerm = (term, transaction) => {
    if (!term) throw new Error('termo-nao-encontrado');

    return db.entities.participanteAceiteTermo.create(
      {
        participanteId: participantId,
        termoId: term.id,
        usuario: user,
      },
      {
        transaction
      });
  };

  const inviteUser = (newParticipant, transaction) => auth.inviteUser(
    {
      nome: newParticipant.contatos[0].nome,
      email: newParticipant.contatos[0].email,
      celular: newParticipant.contatos[0].celular,
      roles: [roles.ecAdministrador],
      convidadoPor: user,
      participante: newParticipant.id,
    },
    transaction
  );

  const getNominations = document => db.entities.participanteIndicacao.findAll({
    attributes: ['id', 'participanteId', 'usuario'],
    where: {
      documento: document,
    },
  });

  const updateNominations = (nominations, usuarioResposta, transaction) => Promise.all(
    nominations.map(n => n.update(
      {
        usuarioResposta,
        status: participanteIndicacaoStatus.aprovado,
        dataFimIndicacao: new Date(),
      },
      { transaction }
    ))
  );

  const createLinks = (nominations, transaction) => Promise.all(
    nominations.map(n => db.entities.participanteVinculo.create(
      {
        participanteEstabelecimentoId: participantId,
        participanteFornecedorId: n.participanteId,
        usuario: n.usuario,
        exibeValorDisponivel: true,
        diasAprovacao: vinculoConfig.defaultApprovingDays,
        estabelecimentoSolicitouVinculo: false,
        status: participanteVinculoStatus.pendente,
      },
      { transaction }
    ))
  );

  return services.findService(id).then(credenciamento => db.transaction(t =>
    services
      .approveService(credenciamento, user, null, t)
      .then((participant) => {
        participantId = participant.id;

        const termoPromise = findTerm().then(term => acceptTerm(term, t));
        const convitePromise = inviteUser(participant, t);
        const indicacoesPromise = getNominations(credenciamento.documento).then(indicacoes =>
          Promise.all([
            updateNominations(indicacoes, user, t),
            createLinks(indicacoes, t),
          ])
        );
        return Promise.all([termoPromise, convitePromise, indicacoesPromise]).then(() => credenciamento);
      })
  ));
};

export default approveUseCase;
