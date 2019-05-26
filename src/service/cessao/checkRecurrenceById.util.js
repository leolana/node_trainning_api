const cessaoTipo = require('./type.enum');
const cessaoStatus = require('./status.enum');
const vinculoStatus = require('../vinculo/status.enum');
const checkRecurrence = require('./checkRecurrence.util');

module.exports = db => (method, ...args) => {
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
    throw String('invalid-method');
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return db.entities.participanteVinculo
    .findOne({
      attributes: ['id'],
      where: filter,
      include: [
        {
          attributes: ['id', 'status', 'dataVencimento', 'dataExpiracao'],
          model: db.entities.cessao,
          as: 'cessoes',
          where: {
            tipo: cessaoTipo.recorrenteAprovacaoAutomatica,
            status: [cessaoStatus.aguardandoAprovacao, cessaoStatus.aprovado],
          },
          required: false,
        },
        {
          attributes: ['id', 'status', 'valorMaximo', 'dataFinalVigencia'],
          model: db.entities.participanteVinculoRecorrente,
          as: 'recorrentes',
          where: {
            status: [vinculoStatus.pendente, vinculoStatus.aprovado],
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
