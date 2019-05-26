module.exports = taxa => {
  const validation = new Promise(of => {
    const now = new Date();

    const tomorrow = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
    );

    if (!taxa.inicio) {
      throw String('missing-inicio-vigencia');
    }

    if (taxa.inicio < tomorrow || taxa.inicio.toString() === 'Invalid Date') {
      throw String('inicio-vigencia-invalid');
    }

    if (taxa.fim) {
      if (taxa.fim < taxa.inicio || taxa.fim.toString() === 'Invalid Date') {
        throw String('termino-vigencia-invalid');
      }
    }

    return of(true);
  });

  return validation;
};
