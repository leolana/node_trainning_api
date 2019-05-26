const installmentOptions = (siscofWrapper: any) => (
  fornecedorId,
  estabelecimentoId,
  dueDate,
  requestedValue,
) => {
  const consultaSiscof = () => {
    const action = siscofWrapper.consultarValorDisponivelCessaoParcelada(
      fornecedorId,
      estabelecimentoId,
      dueDate,
    );
    return action;
  };

  const garanteEstrutura = (arr) => {
    arr.sort((x, y) => x.periodo - y.periodo);

    let qtdPeriodos = 0;
    arr.forEach((option) => {
      qtdPeriodos = Math.max(qtdPeriodos, option.periodo);
    });

    const monthlyValues = [];
    // tslint:disable-next-line:no-increment-decrement
    for (let month = 1; month <= qtdPeriodos; month++) {
      const option = arr.find(o => o.periodo === month);

      if (option) {
        monthlyValues.push(option.valor);
      } else {
        monthlyValues.push(0);
      }
    }

    return Promise.resolve(monthlyValues);
  };

  const mapOptions = (availableMonthlyValues) => {
    // [400, 300, 200, 250, 330, 195]

    const options = availableMonthlyValues
      .map((_, i) => {
        const installmentMonth = i + 1;
        const installmentValue = requestedValue / installmentMonth;

        const isAvailable = availableMonthlyValues
          .slice(0, installmentMonth)
          .every(value => value >= installmentValue);

        if (!isAvailable) return false;

        return {
          month: installmentMonth,
          value: installmentValue,
        };
      })
      .slice(1)
      .filter(v => v !== false);

    return Promise.resolve(options);
  };

  return consultaSiscof()
    .then(garanteEstrutura)
    .then(mapOptions);
};

export default installmentOptions;
