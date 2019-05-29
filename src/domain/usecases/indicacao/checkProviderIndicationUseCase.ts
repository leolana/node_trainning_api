const checkProviderIndicationUseCase = db => (estabelecimentoId, documento) => {
  function findIndicacao() {
    return (db.models as any).participanteIndicacao.findOne({
      attributes: ['nome'],
      where: {
        documento,
        participanteId: estabelecimentoId,
      },
    }).then((indication) => {
      if (indication) {
        indication.dataValues.jaFoiIndicado = true;
        return indication.dataValues;
      }
      return {};
    });
  }

  function findFornecedor() {
    return (db.models as any).participanteFornecedor.findOne({
      include: [{
        model: (db.models as any).participante,
        as: 'participante',
        attributes: ['id', 'nome', 'documento'],
        where: { documento },
      }],
    }).then((provider) => {
      if (provider) {
        return provider.participante.dataValues;
      }
      return findIndicacao();
    });
  }

  return findFornecedor();
};

export default checkProviderIndicationUseCase;
