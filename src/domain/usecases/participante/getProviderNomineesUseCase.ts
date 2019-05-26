
const getProviderNomineesUseCase = db => (idEstabelecimento) => {
  const data: any = {};
  const getParticipant = () => {
    return db.entities.participanteEstabelecimento
      .findOne({
        attributes: ['participanteId'],
        include: [{
          as: 'participante',
          model: db.entities.participante,
          attributes: ['id', 'documento', 'ativo'],
        }],
      })
      .then((arr) => {
        if (!arr) throw new Error('participante-nao-encontrado');
        data.participante = arr.participante;
        return data;
      });
  };

  const getNominees = () => {
    return db.entities.participanteIndicacao.findAll({
      where: { participanteId: idEstabelecimento },
      include: [{
        model: db.entities.motivoTipoRecusa,
        include: [{
          model: db.entities.motivoRecusa,
          as: 'motivoRecusa',
          attributes: ['id', 'descricao', 'requerObservacao'],
          where: { ativo: true },
        }],
      }],
    })
      .then((arr) => {
        data.indicacoes = arr;
      });
  };

  const mapNominees = () => {
    data.indicacoes.forEach((i) => {
      if (i.motivoTipoRecusa
        && i.motivoTipoRecusa.motivoRecusa
        && !i.motivoTipoRecusa.motivoRecusa.requerObservacao) {
        i.motivo = i.motivoTipoRecusa.motivoRecusa.descricao;
      }
    });

    const dados = data.indicacoes.map(i => ({
      id: i.id,
      dataCadastro: i.createdAt,
      status: i.status,
      documento: i.documento,
      participante: {
        id: data.participante.id,
        documento: data.participante.documento,
      },
      contato: {
        nome: i.nome,
        email: i.email,
        telefone: i.telefone,
      },
      motivoCancelamento: i.motivo,
      dataCancelamento: (i.motivoTipoRecusa && i.motivoTipoRecusa.motivoRecusa)
        ? i.dataFimIndicacao : null,
    }));
    return dados;
  };

  return getParticipant()
    .then(getNominees)
    .then(mapNominees);
};

export default getProviderNomineesUseCase;
