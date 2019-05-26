const validateFee = (taxa) => {
  const validation = new Promise((of) => {
    const now = new Date();

    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    if (!taxa.inicio) {
      throw new Error('missing-inicio-vigencia');
    }

    if (taxa.inicio < tomorrow || taxa.inicio.toString() === 'Invalid Date') {
      throw new Error('inicio-vigencia-invalid');
    }

    if (taxa.fim) {
      if (taxa.fim < taxa.inicio || taxa.fim.toString() === 'Invalid Date') {
        throw new Error('termino-vigencia-invalid');
      }
    }

    return of(true);
  });

  return validation;
};

export default validateFee;
