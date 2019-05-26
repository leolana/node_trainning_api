const Sequelize = require('sequelize');

module.exports = (di) => {
  di.provide(
    '@participante-historico.entities',
    '@@tipos-pessoa',
    (tiposPessoa) => {
      const _tiposPessoa = [];

      for (const t in tiposPessoa) _tiposPessoa.push(tiposPessoa[t]);

      return Promise.resolve({
        identity: 'participanteHistorico',
        attributes: {
          participanteId: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          tipoPessoa: {
            type: Sequelize.SMALLINT,
            allowNull: false,
            isIn: [_tiposPessoa],
          },
          ramoAtividadeCodigo: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          documento: {
            type: Sequelize.STRING(18),
            allowNull: false,
          },
          nome: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          aberturaNascimento: {
            type: Sequelize.DATEONLY,
            allowNull: true,
          },
          telefone: {
            type: Sequelize.STRING(10),
            allowNull: false,
          },
          cep: {
            type: Sequelize.STRING(8),
            allowNull: false,
          },
          logradouro: {
            type: Sequelize.STRING(200),
            allowNull: false,
          },
          numero: {
            type: Sequelize.STRING(15),
            allowNull: false,
          },
          complemento: {
            type: Sequelize.STRING(50),
          },
          bairro: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          cidadeId: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          nomeMae: {
            type: Sequelize.STRING(100),
          },
          razaoSocial: {
            type: Sequelize.STRING(100),
          },
          inscricaoEstadual: {
            type: Sequelize.STRING(15),
          },
          inscricaoMunicipal: {
            type: Sequelize.STRING(15),
          },
          ativo: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,
          },
          usuario: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          arquivos: {
            type: Sequelize.JSONB,
          },
        },
      });
    }
  );
};
