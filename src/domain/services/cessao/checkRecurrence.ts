import participanteVinculoStatus from '../../entities/participanteVinculoStatus';
import cessaoTypeEnum from './cessaoTypeEnum';
import cessaoStatusEnum from './cessaoStatusEnum';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { DateTime } from 'luxon';

const checkRecurrence = db => async (vinculo) => {
  const recorrencia = {
    permitido: false,
    valorMaximoRecorrente: null,
    dataExpiracaoRecorrente: null,
  };

  if (vinculo.recorrentes.length > 0) {
    const recorrente = vinculo.recorrentes[0];

    if (recorrente.status !== participanteVinculoStatus.aprovado) {
      throw new Exceptions.InvalidRecurrencyException();
    }

    let cessoes: any[];
    if (vinculo.cessoes) {
      cessoes = vinculo.cessoes.filter((c) => {
        const automatica = c.tipo === cessaoTypeEnum.recorrenteAprovacaoAutomatica;
        const naoRecusada = c.status !== cessaoStatusEnum.recusado;
        return automatica && naoRecusada;
      });
    } else {
      cessoes = await (db.models as any).cessao.findAll({
        where: {
          participanteVinculoId: vinculo.id,
          tipo: cessaoTypeEnum.recorrenteAprovacaoAutomatica,
          $not: {
            status: cessaoStatusEnum.recusado,
          },
        },
      });
    }

    const dateNow = DateTime.local();

    const pendente = cessoes.some((c) => {
      const aguardando = c.status === cessaoStatusEnum.aguardandoAprovacao;
      const naoExpirada = c.dataExpiracao > dateNow;

      return aguardando && naoExpirada;
    });

    if (pendente) {
      throw new Exceptions.ExistentePendingCessionException();
    }

    const dataFinalVigencia = DateTime.fromISO(recorrente.dataFinalVigencia).toJSDate();
    if (dataFinalVigencia < dateNow.toJSDate()) {
      throw new Exceptions.ExpiredRecurrencyException();
    }
    const inicio = dateNow.startOf('month').toJSDate();
    const fim = dateNow.plus({ month: 1 }).endOf('month').toJSDate();

    const existPendingCession = cessoes.some((c) => {
      const dataCriacao = DateTime.fromISO(c.createdAt).toJSDate();
      return dataCriacao >= inicio && fim >= dataCriacao;
    });

    if (existPendingCession) {
      throw new Exceptions.ExistentePendingCessionThisMonthException();
    }

    recorrencia.permitido = true;
    recorrencia.valorMaximoRecorrente = recorrente.valorMaximo;
    recorrencia.dataExpiracaoRecorrente = recorrente.dataFinalVigencia;

    return recorrencia;
  }

  recorrencia.permitido = true;
  return recorrencia;
};

export default checkRecurrence;
