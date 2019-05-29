const findCurrentByType = db => (tipo) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const vigenciaValida = {
    inicio: { $lte: today },
    fim: {
      $or: {
        $eq: null,
        $gt: now,
      },
    },
  };

  const filtro = {
    ...vigenciaValida,
    tipo,
  };

  return (db.models as any).Termo.findOne({
    where: filtro,
    attributes: ['id', 'titulo', 'texto', 'tipo'],
  });
};

export default findCurrentByType;
