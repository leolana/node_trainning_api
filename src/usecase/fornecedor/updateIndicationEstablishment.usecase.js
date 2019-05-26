const canaisEntrada = require(
  '../../service/participante/nominationSource.enum'
);

module.exports = db => (
  indicacaoId, participanteId,
  documento, nome, email, telefone,
  usuario
) => db
  .entities.participanteIndicacao
  .findOne({
    where: {
      id: indicacaoId,
      participanteId,
      canalEntrada: canaisEntrada.indicacaoPorFornecedor,
    },
  })
  .then((indicacao) => {
    if (!indicacao) {
      throw String('indicacao-not-found');
    }

    return indicacao.update({
      documento,
      nome,
      email,
      telefone,
      usuario,
    });
  });
