import findAvailableValue from './findAvailableValue';
import { BondNotFoundException } from '../../../interfaces/rest/exceptions/ApiExceptions';

const findById = (db, siscofWrapper) => async (vinculoId, include = []) => {
  const vinculo = await (db.models as any).ParticipanteVinculo.findOne({
    include,
    where: { id: vinculoId },
  });

  if (!vinculo) {
    throw new BondNotFoundException();
  }

  return findAvailableValue(siscofWrapper)(vinculo);
};

export default findById;
