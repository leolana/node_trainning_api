const canaisEntrada = require(
  '../../service/participante/nominationSource.enum'
);

module.exports = db => (indicacaoId, participanteId) => db
  .entities.participanteIndicacao
  .findOne({
    where: {
      id: indicacaoId,
      participanteId,
      canalEntrada: canaisEntrada.indicacaoPorFornecedor,
    },
    attributes: ['documento', 'nome', 'email', 'telefone'],
  })
  .then((indicacao) => {
    if (!indicacao) {
      throw String('indicacao-not-found');
    }
    return indicacao;
  });
