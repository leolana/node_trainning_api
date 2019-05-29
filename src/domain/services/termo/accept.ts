const accept = db => (id, participanteId, user) => {
  const get = () => {
    const action = db.model.termo.findOne({
      where: { id },
      attributes: ['id'],
    });
    return (action);
  };

  return get().then((termo) => {
    if (!termo) {
      throw new Error('termo-nao-encontrado');
    }

    return (db.models as any).participanteAceiteTermo.create({
      participanteId,
      termoId: termo.id,
      usuario: user,
    });
  });
};

export default accept;
