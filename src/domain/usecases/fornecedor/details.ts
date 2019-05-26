const details = db => (id) => {
  const find = fornecedorId => db.entities.participante
    .findOne({
      where: { id: fornecedorId },
      include: [
        {
          model: db.entities.participanteContato,
          as: 'contatos',
          where: { ativo: true },
        },
        {
          model: db.entities.participanteDomicilioBancario,
          as: 'domiciliosBancarios',
          required: false,
        },
        {
          model: db.entities.participanteTaxa,
          as: 'taxas',
          required: false,
        },
      ],
    });

  const formatData = (supplier) => {
    if (!supplier) throw new Error('fornecedor-nao-encontrado');

    const result = supplier.dataValues;

    if (supplier.contatos.length > 0) {
      result.contato = supplier.contatos[0].dataValues;
    }

    delete result.contatos;

    supplier.arquivos = supplier.arquivos || {};

    const arquivos = (supplier.arquivos.analises || []).map(t => ({
      id: t.id,
      tipo: 'analise',
      arquivo: t.arquivo,
      observacao: t.observacao,
    }));

    if (supplier.arquivos.identidade) {
      arquivos.push({
        tipo: 'identidade',
        arquivo: supplier.arquivos.identidade,
      });
    }

    if (supplier.arquivos.fichaCadastro) {
      arquivos.push({
        tipo: 'fichaCadastro',
        arquivo: supplier.arquivos.fichaCadastro,
      });
    }

    if (supplier.arquivos.comprovanteDeResidencia) {
      arquivos.push({
        tipo: 'comprovanteDeResidencia',
        arquivo: supplier.arquivos.comprovanteDeResidencia,
      });
    }

    if (supplier.arquivos.contratoSocial) {
      arquivos.push({
        tipo: 'contratoSocial',
        arquivo: supplier.arquivos.contratoSocial,
      });
    }

    result.arquivos = arquivos;

    return result;
  };

  return find(id)
    .then(formatData);
};

export default details;
