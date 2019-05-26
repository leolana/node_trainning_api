const { DateTime } = require('luxon');
// eslint-disable-next-line max-len
const deformatDocument = require('../../service/credenciamento/deformatDocument.service');

module.exports = db => (options) => {
  let collection = null;

  const getParams = () => {
    const where = { };
    const attr = [
      'id',
      'tipoPessoa',
      'nome',
      'documento',
      'createdAt',
      'arquivos',
      'participanteId',
    ];

    if (options.de) {
      // TODO: Verificar como as datas estão formatadas no front
      //  atualmente o formato enviado não é suportado pelo luxon
      options.de = DateTime.fromJSDate(new Date(options.de)).toSQLDate();
    }

    if (options.ate) {
      const date = DateTime.fromJSDate(new Date(options.ate)).plus({ days: 1 });
      options.ate = date.toSQLDate();
    }

    if (options.de && options.ate) {
      where.createdAt = {
        $between: [options.de, options.ate],
      };
    } else if (options.de) {
      where.createdAt = {
        $gte: options.de,
      };
    } else if (options.ate) {
      where.createdAt = {
        $lte: options.ate,
      };
    }

    if (options.nome) {
      where.nome = { $iLike: `%${options.nome}%` };
    }

    if (options.preCadastro) {
      collection = db.entities.credenciamentoProposta;
    } else {
      if (options.status) {
        where.status = options.status;
      }
      where.ativo = true;
      attr.push('status');
      collection = db.entities.credenciamento;
    }

    if (options.codigoEc) {
      where.participanteId = options.codigoEc;
    }

    if (options.documento) {
      where.documento = {
        $iLike: `%${deformatDocument(options.documento)}%`,
      };
    }

    return {
      where,
      attributes: attr,
    };
  };

  const find = params => collection.findAll(params);

  return Promise.resolve(getParams())
    .then(find);
};
