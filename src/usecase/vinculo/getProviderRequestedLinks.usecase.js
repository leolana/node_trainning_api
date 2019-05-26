const { DateTime } = require('luxon');
// eslint-disable-next-line max-len
const deformatDocument = require('../../service/credenciamento/deformatDocument.service');


module.exports = db => (
  fornecedorId,
  linkStatus,
  nome,
  documento,
  dataCadastroInicio,
  dataCadastroFim
) => {
  function get() {
    const filter = { };

    const linkFilter = {
      participanteFornecedorId: fornecedorId,
      status: linkStatus,
    };

    if (nome) {
      filter.nome = { $iLike: `%${nome}%` };
    }

    if (documento) {
      filter.documento = { $like: `%${deformatDocument(documento)}%` };
    }

    if (dataCadastroInicio) {
      linkFilter.createdAt = {
        $gte: DateTime.fromISO(dataCadastroInicio)
          .toSQLDate(),
      };
    }

    if (dataCadastroFim) {
      if (!linkFilter.createdAt) {
        linkFilter.createdAt = {};
      }
      linkFilter.createdAt.$lte = DateTime.fromISO(dataCadastroFim)
        .plus({ day: 1 })
        .toSQLDate();
    }

    return db.entities.participanteVinculo
      .findAll({
        attributes: [
          'id',
          'createdAt',
        ],
        where: linkFilter,
        include: [{
          model: db.entities.participanteEstabelecimento,
          as: 'estabelecimento',
          attributes: ['participanteId'],
          required: true,
          include: [{
            model: db.entities.participante,
            as: 'participante',
            attributes: ['id', 'documento', 'tipoPessoa', 'nome', 'telefone'],
            where: filter,
            required: true,
            include: [{
              model: db.entities.participanteContato,
              as: 'contatos',
              where: {
                ativo: true,
              },
              required: true,
            }],
          }],
        }],
      });
  }

  function getInvitations(documents) {
    const filter = { };
    if (documents) {
      filter.documento = { $in: documents };
    }
    return db.entities.participanteIndicacao
      .findAll({
        attributes: [
          'id',
          'nome',
          'documento',
          'email',
          'createdAt',
          'canalEntrada',
          'telefone',
        ],
        filter,
      });
  }
  function map(vinculos) {
    return vinculos.map((v) => {
      const { participante } = v.estabelecimento;
      return {
        idVinculo: v.id,
        documento: participante.documento,
        nome: participante.nome,
        dataCadastro: v.createdAt,
        telefone: participante.telefone,
        email: participante.contatos[0].email,
      };
    });
  }


  function setReturnInvitation() {
    const resultPromisse = new Promise(((resolve) => {
      get().then((participantesModel) => {
        const mappedParticipantes = map(participantesModel);
        const allDocuments = mappedParticipantes.map(v => ({
          documento: v.documento,
        }));
        const ret = [];
        getInvitations(allDocuments).then((allInvitations) => {
          mappedParticipantes.forEach((participante) => {
            const documentInvitation = allInvitations.find(
              invite => invite.documento === participante.documento
            );
            if (documentInvitation && documentInvitation.dataValues) {
              participante.data = documentInvitation.dataValues.createdAt;
            }
            ret.push(participante);
          });
          resolve(ret);
        });
      });
    }));

    return resultPromisse;
  }

  return setReturnInvitation();
};
