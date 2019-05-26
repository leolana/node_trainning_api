const vinculoStatus = require('../vinculo/status.enum');
const cessaoTipo = require('./type.enum');
const cessaoStatus = require('./status.enum');

module.exports = db => vinculo => {
  const retorno = {
    permitido: false,
    valorMaximoRecorrente: null,
    dataExpiracaoRecorrente: null,
  };

  if (vinculo.recorrentes.length > 0) {
    const recorrente = vinculo.recorrentes[0];

    if (recorrente.status !== vinculoStatus.aprovado) {
      retorno.message = 'status-recorrencia-invalido';
      return Promise.resolve(retorno);
    }

    let getCessoes;

    if (vinculo.cessoes) {
      getCessoes = Promise.resolve(
        vinculo.cessoes.filter(c => {
          const automatica =
            c.tipo === cessaoTipo.recorrenteAprovacaoAutomatica;

          return automatica && c.status !== cessaoStatus.recusado;
        }),
      );
    } else {
      getCessoes = db.entities.cessao.findAll({
        where: {
          participanteVinculoId: vinculo.id,
          tipo: cessaoTipo.recorrenteAprovacaoAutomatica,
          $not: {
            status: cessaoStatus.recusado,
          },
        },
      });
    }

    return getCessoes.then(cessoes => {
      const valiDate = new Date();

      const pendente = cessoes.some(c => {
        const aguardando = c.status === cessaoStatus.aguardandoAprovacao;
        return aguardando && new Date(c.dataExpiracao) > valiDate;
      });

      if (pendente) {
        retorno.message = 'cessao-pendente-existente';
      } else if (new Date(recorrente.dataFinalVigencia) >= valiDate) {
        const inicio = new Date(valiDate.getFullYear(), valiDate.getMonth(), 1);
        const fim = new Date(
          valiDate.getFullYear(),
          valiDate.getMonth() + 1,
          0,
        );

        if (
          cessoes.some(c => {
            const data = new Date(c.createdAt);
            return data >= inicio && fim >= data;
          })
        ) {
          retorno.message = 'cessao-recorrente-existente-no-mes';
        } else {
          retorno.permitido = true;
          retorno.valorMaximoRecorrente = recorrente.valorMaximo;
          retorno.dataExpiracaoRecorrente = recorrente.dataFinalVigencia;
        }
      } else {
        retorno.message = 'recorrencia-expirada';
      }

      return retorno;
    });
  }

  retorno.permitido = true;
  return Promise.resolve(retorno);
};
