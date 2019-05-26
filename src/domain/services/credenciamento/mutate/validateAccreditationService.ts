import { DateTime } from 'luxon';

import personTypeEnum from '../../participante/personTypeEnum';
import * as Exceptions from '../../../../interfaces/rest/exceptions/ApiExceptions';

/**
 * Estoura exceptions quando:
 * 1. o (tipoPessoa) é inválido.
 * 2. A (dataNascimentoAbertura) é uma data futura.
 * 3. Algum sócio tem (aberturaNascimento) sendo data futura.
 *
 * @param credenciamento objeto com os dados do credenciamento que está sendo adicionado/editado
 */
const validateAccreditationService = async (credenciamento: any) => {
  if (!Object.values(personTypeEnum).some(t => t === credenciamento.tipoPessoa)) {
    throw new Exceptions.InvalidTypeOfPersonException();
  }

  const dataNascimentoAbertura = DateTime
    .fromISO(credenciamento.dadosCadastrais.aberturaNascimento)
    .toJSDate();
  const today = DateTime.local().toJSDate();

  if (dataNascimentoAbertura > today) {
    throw new Exceptions.InvalidSentDataException();
  }

  const { socios } = credenciamento.dadosCadastrais;

  if (socios) {
    socios.forEach((socio: any) => {
      const dataAberturaNascimentoSocio = DateTime
        .fromISO(socio.aberturaNascimento)
        .toJSDate();

      if (dataAberturaNascimentoSocio > today) {
        throw new Exceptions.InvalidPartnerBirthDateException();
      }
    });
  }
};

export default validateAccreditationService;
