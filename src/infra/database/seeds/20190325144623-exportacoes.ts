import { QueryInterface } from 'sequelize';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const sequelize = queryInterface.sequelize;

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const exportacoes = [
      {
        id: 1,
        arquivo: 'remessa_vendas_{date}.csv',
        titulo: 'Remessa de Vendas',
        // tslint:disable-next-line:max-line-length
        descricao: 'E esta ave estranha e escura fez sorrir minha amargura, Com o solene decoro de seus ares rituais. "Tens o aspecto tosquiado", disse eu, "mas de nobre e ousado, Ó velho corvo emigrado lá das trevas infernais!"',
        ...timestamp
      },
      {
        id: 2,
        arquivo: 'registro_vendas_detalhe_{date}.csv',
        titulo: 'Registro de Vendas Detalhe',
        descricao: 'Seco de raiva, coloco no colo caviar e doces.',
        ...timestamp
      },
      {
        id: 3,
        arquivo: 'registro_vendas_resumo_{date}.csv',
        titulo: 'Registro de Vendas Resumo',
        descricao: 'Um pequeno jabuti xereta viu dez cegonhas felizes.',
        ...timestamp
      },
      {
        id: 4,
        arquivo: 'pagamentos_{date}.csv',
        titulo: 'Pagamentos',
        descricao: 'Qual é a velocidade de vôo de uma andorinha sem carga?',
        ...timestamp
      },
      {
        id: 5,
        arquivo: 'ajustes_tarifas_{date}.csv',
        titulo: 'Ajustes Tarifas',
        descricao: 'Ninguém espera a inquisição espanhola.',
        ...timestamp
      },
      {
        id: 6,
        arquivo: 'financeiro_{date}.csv',
        titulo: 'Financeiro',
        descricao: 'Mais vale um pássaro na mão que dois voando.',
        ...timestamp
      },
    ];

    const participantes = (await sequelize.query(
      'SELECT id FROM participante;',
      { type: sequelize.QueryTypes.SELECT }
    )) as any[];

    const inserted = (await queryInterface.bulkInsert('exportacao', exportacoes, { returning: true })) as any[];

    const participanteExportacoes = inserted.reduce((acc, curr) => {
      return acc.concat(participantes.map(p => ({
        exportacaoId: curr.id,
        participanteId: p.id,
        ...timestamp
      })));
    },                                              []);

    return queryInterface.bulkInsert('participanteExportacao', participanteExportacoes, {});
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('participanteExportacao', null, {});
    return queryInterface.bulkDelete('exportacao', null, {});
  }
};
