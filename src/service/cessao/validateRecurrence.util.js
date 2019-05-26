const cessaoTipo = require('./type.enum');
const checkRecurrence = require('./checkRecurrence.util');
const vinculoStatus = require('../vinculo/status.enum');

module.exports = db => (
  valor,
  dataVencimento,
  valorMaximo,
  dataFinalVigencia,
  user,
  vinculo,
) => {
  const action = checkRecurrence(db)(vinculo).then(retorno => {
    if (retorno.permitido) {
      let existente = false;

      if (retorno.valorMaximoRecorrente && retorno.dataExpiracaoRecorrente) {
        valorMaximo = retorno.valorMaximoRecorrente;
        dataFinalVigencia = new Date(retorno.dataExpiracaoRecorrente);
        existente = true;
      }

      if (valor > valorMaximo)
        throw String('valor-solicitado-superior-valor-recorrente');

      if (
        vinculo.cessoes &&
        vinculo.cessoes.some(c => {
          const data = new Date(c.dataVencimento);
          const inicio = new Date(data.getFullYear(), data.getMonth(), 1);
          const fim = new Date(data.getFullYear(), data.getMonth() + 1, 0);
          return (
            c.tipo === cessaoTipo.recorrenteAprovacaoAutomatica &&
            dataVencimento >= inicio &&
            dataVencimento <= fim
          );
        })
      )
        throw String('cessao-recorrente-existente-no-mes-vencimento');

      if (!existente) {
        const diff = Math.abs(
          dataFinalVigencia.getTime() - new Date().getTime(),
        );

        if (Math.ceil(diff / (1000 * 3600 * 24)) < 30)
          throw String('data-expiracao-inferior-30-dias');

        return db.entities.participanteVinculoRecorrente
          .create({
            participanteVinculoId: vinculo.id,
            status: vinculoStatus.pendente,
            valorMaximo,
            dataFinalVigencia,
            usuario: user,
          })
          .then(rec => vinculo.recorrentes.push(rec));
      }
    } else {
      throw retorno.message;
    }
    return retorno;
  });

  return action;
};
