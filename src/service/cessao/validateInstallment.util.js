const installmentOptions = require('./installmentOptions.util');

module.exports = siscofWrapper => (
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

  const findOption = options => {
    const option = options.find(o => o.month === installmentMonth);
    if (!option) {
      throw String('option-not-available');
    }
    return Promise.resolve(option);
  };

  return getOptions().then(findOption);
};
