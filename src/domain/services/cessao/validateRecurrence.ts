// tslint:disable:no-parameter-reassignment

import cessaoTypeEnum from './cessaoTypeEnum';
import checkRecurrence from './checkRecurrence';
import participanteVinculoStatus from '../../entities/participanteVinculoStatus';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const validateRecurrence = db => async (
  valor,
  dataVencimento,
  valorMaximo,
  dataFinalVigencia,
  user,
  vinculo,
) => {
  const recorrencia = await checkRecurrence(db)(vinculo);
  if (recorrencia.permitido) {
    let existente = false;

    if (recorrencia.valorMaximoRecorrente && recorrencia.dataExpiracaoRecorrente) {
      valorMaximo = recorrencia.valorMaximoRecorrente;
      dataFinalVigencia = new Date(recorrencia.dataExpiracaoRecorrente);
      existente = true;
    }

    if (valor > valorMaximo) {
      throw new Exceptions.RequestedValueAboveRecurrentValueException();
    }

    if (
      vinculo.cessoes &&
      vinculo.cessoes.some((c) => {
        const data = new Date(c.dataVencimento);
        const inicio = new Date(data.getFullYear(), data.getMonth(), 1);
        const fim = new Date(data.getFullYear(), data.getMonth() + 1, 0);
        return (
          c.tipo === cessaoTypeEnum.recorrenteAprovacaoAutomatica &&
          dataVencimento >= inicio &&
          dataVencimento <= fim
        );
      })
    ) {
      throw new Exceptions.ExistentCessionOnRecurrentMonthException();
    }

    if (!existente) {
      const diff = Math.abs(
        dataFinalVigencia.getTime() - new Date().getTime(),
      );

      // tslint:disable-next-line:no-magic-numbers
      if (Math.ceil(diff / (1000 * 3600 * 24)) < 30) {
        throw new Exceptions.ExpirationDateUnderThirtyDaysException();
      }

      const recorrentes = await (db.models as any).participanteVinculoRecorrente
        .create({
          valorMaximo,
          dataFinalVigencia,
          participanteVinculoId: vinculo.id,
          status: participanteVinculoStatus.pendente,
          usuario: user.email,
        });
      return vinculo.recorrentes.push(recorrentes);
    }
  }
  return recorrencia;
};

export default validateRecurrence;
