import installmentOptions from './installmentOptions';
import { NotAvailableOptionException } from '../../../interfaces/rest/exceptions/ApiExceptions';

const validateInstallment = siscofWrapper => (
  requestedValue,
  dueDate,
  installmentMonth,
  fornecedorId,
  estabelecimentoId,
) => {
  //

  const getOptions = () => {
    const action = installmentOptions(siscofWrapper)(
      fornecedorId,
      estabelecimentoId,
      dueDate,
      requestedValue,
    );
    return action;
  };

  const findOption = (options) => {
    const option = options.find(o => o.month === installmentMonth);
    if (!option) {
      throw new NotAvailableOptionException();
    }
    return Promise.resolve(option);
  };

  return getOptions().then(findOption);
};

export default validateInstallment;
