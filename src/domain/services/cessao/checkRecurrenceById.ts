import cessaoTypeEnum from './cessaoTypeEnum';
import cessaoStatusEnum from './cessaoStatusEnum';
import participanteVinculoStatus from '../../entities/participanteVinculoStatus';
import checkRecurrence from './checkRecurrence';

const checkRecurrenceById = db => (method, ...args) => {
  let filter = null;

  if (method === 'participantes') {
    filter = {
      participanteEstabelecimentoId: args[0],
      participanteFornecedorId: args[1],
    };
  } else if (method === 'vinculo') {
    filter = {
      id: args[0],
    };
  } else {
    throw new Error('invalid-method');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return (db.models as any).participanteVinculo
    .findOne({
      attributes: ['id'],
      where: filter,
      include: [
        {
          attributes: ['id', 'status', 'dataVencimento', 'dataExpiracao'],
          model: (db.models as any).cessao,
          as: 'cessoes',
          where: {
            tipo: cessaoTypeEnum.recorrenteAprovacaoAutomatica,
            status: [cessaoStatusEnum.aguardandoAprovacao, cessaoStatusEnum.aprovado],
          },
          required: false,
        },
        {
          attributes: ['id', 'status', 'valorMaximo', 'dataFinalVigencia'],
          model: (db.models as any).participanteVinculoRecorrente,
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
    })
    .then(vinculo => checkRecurrence(db)(vinculo));
};

export default checkRecurrenceById;
