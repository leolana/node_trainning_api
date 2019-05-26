module.exports = db => (
  participant,
  transaction
) => db.entities.participanteHistorico
  .create({
    participanteId: participant.id,
    tipoPessoa: participant.tipoPessoa,
    ramoAtividadeCodigo: participant.ramoAtividadeCodigo,
    documento: participant.documento,
    nome: participant.nome,
    aberturaNascimento: participant.aberturaNascimento,
    telefone: participant.telefone,
    cep: participant.cep,
    logradouro: participant.logradouro,
    numero: participant.numero,
    complemento: participant.complemento,
    bairro: participant.bairro,
    cidadeId: participant.cidadeId,
    nomeMae: participant.nomeMae,
    razaoSocial: participant.razaoSocial,
    inscricaoEstadual: participant.inscricaoEstadual,
    inscricaoMunicipal: participant.inscricaoMunicipal,
    ativo: participant.ativo,
    usuario: participant.usuario,
    arquivos: participant.arquivos,
  }, { transaction });
