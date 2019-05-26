import { DateTime } from 'luxon';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const validate = (valor, dataExpiracao, dataVencimento, vinculo) => {
  const today = DateTime.local().toISODate();

  const dataMinExpiracao = DateTime.fromISO(today, { zone: 'utc' })
    .plus({ day: 2 })
    .toUTC()
    .toJSDate();

  const dataMinVencimento = DateTime.fromISO(today, { zone: 'utc' })
    .plus({ day: 2 })
    .toUTC()
    .toJSDate();

  if (valor > vinculo.valorDisponivel) {
    throw new Exceptions.RequestestedValueAboveAvailableException();
  }

  if (dataExpiracao < dataMinExpiracao) {
    throw new Exceptions.ExpirationDateBeforeNextTwoDaysException();
  }

  if (dataVencimento < dataMinVencimento) {
    throw new Exceptions.MaturityDateBeforeNextTwoDaysException();
  }

  if (dataExpiracao >= dataVencimento) {
    throw new Exceptions.ExpirationDateAfterMaturityException();
  }

  return true;
};

export default validate;
