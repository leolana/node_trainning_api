const cessaoTipo = require('./type.enum');
const cessaoStatus = require('./status.enum');
const vinculoStatus = require('../vinculo/status.enum');

module.exports = (db, siscofWrapper) => (
  aprovado,
  cessao,
  termoId,
  recorrencia,
  user,
) => {
  if (cessao.tipo === cessaoTipo.recorrenteAprovacaoAutomatica) {
    if (!recorrencia) throw String('recorrencia-invalida');
  }

  if (cessao.status !== cessaoStatus.aguardandoAprovacao)
    throw String('status-cessao-invalido');

  const timestamp = new Date();

  cessao.dataRespostaEstabelecimento = timestamp;
  cessao.usuarioRespostaEstabelecimento = user;
  cessao.status = aprovado ? cessaoStatus.aprovado : cessaoStatus.recusado;

  return siscofWrapper
    .aprovarRecusarCessao(cessao.codigoCessao, cessao.referencia, aprovado)
    .then(() => {
      const action = db.transaction(t => {
        const promises = [
          cessao.save({ transaction: t }),
          db.entities.cessaoAceite.create(
            {
              cessaoId: cessao.id,
              termoId,
              status: cessao.status,
              usuario: user,
            },
            { transaction: t },
          ),
        ];

        if (recorrencia && recorrencia.status === vinculoStatus.pendente) {
          recorrencia.usuarioAprovadorEstabelecimento = user;
          recorrencia.dataAprovacaoEstabelecimento = timestamp;
          recorrencia.status = aprovado
            ? vinculoStatus.aprovado
            : vinculoStatus.reprovado;
          promises.push(recorrencia.save({ transaction: t }));
        }

        return Promise.all(promises);
      });
      return action;
    });
};
