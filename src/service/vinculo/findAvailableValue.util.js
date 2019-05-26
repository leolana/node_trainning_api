module.exports = siscofWrapper => (vinculo) => {
  const fornecedorId = vinculo.participanteFornecedorId;
  const estabelecimentoId = vinculo.participanteEstabelecimentoId;

  if (vinculo.exibeValorDisponivel === false) {
    vinculo.valorDisponivel = 0;
    vinculo.dataValues.valorDisponivel = 0;

    return Promise.resolve(vinculo);
  }

  return siscofWrapper
    .consultarValorDisponivelCessao(fornecedorId, estabelecimentoId)
    .then((valueSiscof) => {
      let value = 0;

      if (vinculo.valorMaximoExibicao !== null) {
        value = Math.min(vinculo.valorMaximoExibicao, valueSiscof);
      } else {
        value = valueSiscof;
      }

      vinculo.valorDisponivel = value;
      vinculo.dataValues.valorDisponivel = value;
      return vinculo;
    });
};
