import { Sequelize } from 'sequelize-database';
import { DateTime } from 'luxon';
import deformatDocument from '../../services/credenciamento/deformatDocument';
import ParticipanteIntegracaoTipo from '../../entities/ParticipanteIntegracaoTipo';
import ParticipanteIntegracaoStatus from '../../entities/ParticipanteIntegracaoStatus';

const search = (db: Sequelize) => (options) => {
  let collection = null;

  const getParams = () => {
    const where: any = {};
    const attr = [
      'id',
      'tipoPessoa',
      'nome',
      'documento',
      'createdAt',
      'updatedAt',
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
      include: [{
        model: db.entities.participante,
        as: 'participante',
        attributes: ['createdAt'],
        required: false,
        include: [{
          model: db.entities.participanteIntegracao,
          as: 'integracoes',
          required: false,
          where: {
            status: ParticipanteIntegracaoStatus.concluido
          }
        }]
      }]
    };
  };

  const find = params => collection.findAll(params);

  const map = credenciamentos => credenciamentos.map(credenciamento => ({
    id: credenciamento.id,
    dataEnvio: credenciamento.createdAt,
    dataAprovado: credenciamento.participante && credenciamento.participante.createdAt,
    status: credenciamento.status,
    documento: credenciamento.documento,
    tipoPessoa: credenciamento.tipoPessoa,
    nome: credenciamento.nome,
    arquivos: credenciamento.arquivos,
    participanteId: options.preCadastro ? null : credenciamento.participanteId,
    integracaoMovidesk: options.preCadastro ? null : ((credenciamento.participante || {}).integracoes || []).some(
      integracao => integracao.tipoIntegracao === ParticipanteIntegracaoTipo.movidesk
    ),
  }));

  return Promise.resolve(getParams())
    .then(find)
    .then(map);
};

export default search;
