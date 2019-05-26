import participanteVinculoStatus from '../../entities/participanteVinculoStatus';
import resolve from './resolve';
import notificate from './notificate';

const approveDisapprove = (
  db,
  siscofWrapper,
  mailer,
  emailTemplates,
  mailerSettings,
  logger
) => (aprovado, participanteId, cessaoId, termoId, user) => {
  const contatoInclude = () => ({
    model: db.entities.participanteContato,
    as: 'contatos',
    attributes: ['participanteId', 'email'],
    where: { ativo: true },
  });

  const participanteInclude = () => ({
    model: db.entities.participante,
    as: 'participante',
    attributes: ['id', 'nome'],
    include: [contatoInclude()],
    where: { ativo: true },
  });

  const vinculoInclude = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      model: db.entities.participanteVinculo,
      as: 'vinculos',
      attributes: ['id', 'participanteFornecedorId'],
      include: [
        {
          model: db.entities.cessao,
          as: 'cessoes',
          where: { id: cessaoId },
        },
        {
          model: db.entities.participanteVinculoRecorrente,
          as: 'recorrentes',
          where: {
            status: [participanteVinculoStatus.pendente, participanteVinculoStatus.aprovado],
            dataFinalVigencia: {
              $gte: today,
            },
          },
          required: false,
        },
      ],
    };
  };

  return db.entities.participanteEstabelecimento
    .findOne({
      where: { participanteId },
      attributes: ['participanteId'],
      include: [participanteInclude(), vinculoInclude()],
    })
    .then((estabelecimento) => {
      if (
        !(
          estabelecimento &&
          estabelecimento.vinculos.length > 0 &&
          estabelecimento.vinculos[0].cessoes.length > 0
        )
      ) {
        throw new Error('cessao-nao-encontrada');
      }

      const vinculo = estabelecimento.vinculos[0];
      const cessao = vinculo.cessoes[0];
      const recorrencia =
        vinculo.recorrentes.length > 0 ? vinculo.recorrentes[0] : null;

      return resolve(db, siscofWrapper)(
        aprovado,
        cessao,
        termoId,
        recorrencia,
        user,
      ).then(() => {
        const action = db.entities.participanteFornecedor
          .findOne({
            where: { participanteId: vinculo.participanteFornecedorId },
            attributes: ['participanteId'],
            include: [participanteInclude()],
          })
          .then((fornecedor) => {
            return notificate(
              mailer,
              emailTemplates,
              mailerSettings,
              logger
            )(
              aprovado,
              cessao.codigoCessao,
              estabelecimento.participante.nome,
              estabelecimento.participante.contatos[0].email,
              fornecedor.participante.nome,
              fornecedor.participante.contatos[0].email,
            );
          });

        return action;
      });
    });
};

export default approveDisapprove;
