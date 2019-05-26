const Sequelize = require('sequelize');

module.exports = di => {
  di.provide(
    '@cessao.entities',
    '@@cessao-status',
    '@@cessao-tipo',
    '@@cessao-diluicao-pagamento',
    (status, tipo, diluicaoPagamento) => {
      const _status = Object.values(status);
      const _tipo = Object.values(tipo);
      const _diluicaoPagamento = Object.values(diluicaoPagamento);

      return Promise.resolve({
        identity: 'cessao',
        attributes: {
          participanteVinculoId: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          solicitante: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          usuario: {
            type: Sequelize.STRING(100),
            allowNull: false,
          },
          status: {
            type: Sequelize.SMALLINT,
            allowNull: false,
            isIn: [_status],
            defaultValue: status.pendente,
          },
          valorSolicitado: {
            type: Sequelize.FLOAT,
            allowNull: false,
          },
          valorDisponivel: {
            type: Sequelize.FLOAT,
            allowNull: false,
          },
          dataVencimento: {
            type: Sequelize.DATEONLY,
            allowNull: false,
          },
          dataExpiracao: {
            type: Sequelize.DATEONLY,
            allowNull: false,
          },
          codigoCessao: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          referencia: {
            type: Sequelize.STRING(30),
            allowNull: true,
          },
          codigoRetornoSiscof: {
            type: Sequelize.INTEGER,
            allowNull: true,
          },
          mensagemRetornoSiscof: {
            type: Sequelize.STRING(500),
            allowNull: true,
          },
          taxaCessao: {
            type: Sequelize.FLOAT,
            allowNull: true,
          },
          fornecedorAceiteTermoId: {
            type: Sequelize.INTEGER,
            allowNull: true, // temporario
          },
          estabelecimentoAceiteTermoId: {
            type: Sequelize.INTEGER,
            allowNull: true, // temporario
          },
          dataRespostaEstabelecimento: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          usuarioRespostaEstabelecimento: {
            type: Sequelize.STRING(100),
            allowNull: true,
          },
          numeroParcelas: {
            type: Sequelize.SMALLINT,
            allowNull: true,
          },
          tipo: {
            type: Sequelize.SMALLINT,
            allowNull: false,
            isIn: [_tipo],
            defaultValue: tipo.cessao,
          },
          diluicaoPagamento: {
            type: Sequelize.SMALLINT,
            allowNull: false,
            isIn: [_diluicaoPagamento],
            defaultValue: diluicaoPagamento.diaVencimento,
          },
        },
        associations: {
          belongsTo: {
            participanteAceiteTermo: {
              as: 'estabelecimentoAceiteTermo',
              foreignKey: { allowNull: false },
            },
          },
          hasMany: {
            cessaoAceite: { as: 'aceites', foreignKey: 'cessaoId' },
            cessaoRecebivel: { as: 'recebiveis', foreignKey: 'cessaoId' },
          },
        },
      });
    },
  );
};
