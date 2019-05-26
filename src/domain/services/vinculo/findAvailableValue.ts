const findAvailableValue = siscofWrapper => (vinculo) => {
  const fornecedorId = vinculo.participanteFornecedorId;
  const estabelecimentoId = vinculo.participanteEstabelecimentoId;

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

export default findAvailableValue;
