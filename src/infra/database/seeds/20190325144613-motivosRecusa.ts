import { QueryInterface } from 'sequelize';

import recusaTipoEnum from '../../../domain/entities/recusaTipoEnum';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const motivos = [
      {
        codigo: '001',
        descricao: 'Dados inconsistentes',
        requerObservacao: false,
        ativo: true,
        ...timestamp
      },
      {
        codigo: '002',
        descricao: 'Fornecedor desconhece o Estabelecimento',
        requerObservacao: false,
        ativo: true,
        ...timestamp
      }, {
        codigo: '003',
        descricao: 'Fornecedor não possui interesse na proposta Alpe',
        requerObservacao: false,
        ativo: true,
        ...timestamp
      }, {
        codigo: '004',
        descricao: 'Taxas não atrativas',
        requerObservacao: false,
        ativo: true,
        ...timestamp
      }, {
        codigo: '005',
        descricao: 'Estabelecimento não possui interesse na proposta Alpe',
        requerObservacao: false,
        ativo: true,
        ...timestamp
      }, {
        codigo: '006',
        descricao: 'Estabelecimento não possui interesse em Cessão',
        requerObservacao: false,
        ativo: true,
        ...timestamp
      }, {
        codigo: '007',
        descricao: 'Estabelecimento não possui limite com fornecedor',
        requerObservacao: false,
        ativo: true,
        ...timestamp
      }, {
        codigo: '008',
        descricao: 'Estabelecimento parou de emitir pedido junto ao Fornecedor',
        requerObservacao: false,
        ativo: true,
        ...timestamp
      }, {
        codigo: '009',
        descricao: 'Fornecedor entregou a mercadoria errada',
        requerObservacao: false,
        ativo: true,
        ...timestamp
      }, {
        codigo: '010',
        descricao: 'Fornecedor entregou mercadoria fora do prazo combinado',
        requerObservacao: false,
        ativo: true,
        ...timestamp
      }, {
        codigo: '099',
        descricao: 'Outros',
        requerObservacao: true,
        ativo: true,
        ...timestamp
      }
    ];

    const tipos = [
      [ // 001
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.cad_fornecedor, ...timestamp },
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.cad_estabelecimento, ...timestamp }
      ],
      [ // 002
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.cad_fornecedor, ...timestamp },
      ],
      [ // 003
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.cad_fornecedor, ...timestamp },
      ],
      [ // 004
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.cad_estabelecimento, ...timestamp },
      ],
      [ // 005
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.cad_estabelecimento, ...timestamp },
      ],
      [ // 006
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.recusa_vinculo, ...timestamp },
      ],
      [ // 007
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.recusa_vinculo, ...timestamp },
      ],
      [ // 008
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.recusa_vinculo, ...timestamp },
      ],
      [ // 009
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.recusa_vinculo, ...timestamp },
      ],
      [ // 010
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.recusa_vinculo, ...timestamp },
      ],
      [ // 099
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.cad_fornecedor, ...timestamp },
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.cad_estabelecimento, ...timestamp },
        { motivoRecusaId: null, recusaTipoId: recusaTipoEnum.recusa_vinculo, ...timestamp },
      ]
    ];

    const inserted = (await queryInterface.bulkInsert('motivoRecusa', motivos, { returning: true })) as any[];

    const data = tipos.reduce((acc, curr, i) => acc.concat(
      curr.map((c) => {
        c.motivoRecusaId = inserted[i].id;
        return c;
      }))
    ,                         []);

    return queryInterface.bulkInsert('motivoTipoRecusa', data, {});
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('motivoTipoRecusa', null, {});
    return queryInterface.bulkDelete('motivoRecusa', null, {});
  }
};
