// tslint:disable: no-magic-numbers
import { QueryInterface } from 'sequelize';

import { defaultUser } from '../consts';
import rateTypeEnum from '../../../domain/services/participante/rateTypeEnum';
import tiposPessoa from '../../../domain/entities/tiposPessoa';

enum TipoParticipante {
  fornecedor = 1,
  ec = 2
}

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const sequelize = queryInterface.sequelize;

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const ramoAtividadeCodigo = 742;
    const banco = { id: '246', text: 'Banco ABC Brasil S.A.' };

    const participantes = [
      {
        ramoAtividadeCodigo,
        cidadeId: null,
        tipoPessoa: tiposPessoa.juridica,
        documento: '01510345000158',
        nome: 'It Lab - Estabelecimento',
        aberturaNascimento: new Date(2002, 1, 15),
        telefone: '1111223344',
        cep: '04533010',
        logradouro: 'Rua Tabapuã',
        numero: '145',
        complemento: 'bloco unico',
        bairro: 'Itaim Bibi',
        razaoSocial: 'It Lab Consultoria e Desenvolvimento de Sistemas LTDA.',
        inscricaoEstadual: '287.046.269.490',
        inscricaoMunicipal: '227.616.175.362',
        ativo: true,
        usuario: defaultUser,
        arquivos: {
          contratoSocial: 'credenciamento/01510345000158/contratoSocial/2018-10-31T14-53-09-039Z/contrato.pdf',
          analises: [],
        },
        ...timestamp
      },
      {
        ramoAtividadeCodigo,
        cidadeId: null,
        tipoPessoa: tiposPessoa.juridica,
        documento: '32608796000156',
        nome: 'KG Menswear - Fornecedor',
        aberturaNascimento: new Date(1985, 7, 13),
        telefone: '2017888135',
        cep: '07304',
        logradouro: 'Desert Broom Court',
        numero: '1138',
        complemento: '',
        bairro: 'Jersey City',
        razaoSocial: 'KG Menswear LTDA.',
        inscricaoEstadual: '4485.5579.9298',
        inscricaoMunicipal: '5399.1521.6999',
        ativo: true,
        usuario: defaultUser,
        arquivos: {},
        ...timestamp
      }
    ];

    const tiposParticipante = [
      // Participante 1
      TipoParticipante.ec,
      // Participante 2
      TipoParticipante.fornecedor
    ];

    const contatos = [
      { // Participante 1
        participanteId: null,
        nome: 'Samuel Jackson',
        email: 'samuel.jackson@itlab.com.br',
        celular: '11998217734',
        ativo: true,
        ...timestamp
      },
      { // Participante 2
        participanteId: null,
        nome: 'Harrison Ford',
        email: 'harrison@kg.com',
        celular: '11999237831',
        ativo: true,
        ...timestamp
      }
    ];

    const taxas = [
      [ // Participante 1
        {
          participanteId: null,
          valorInicio: null,
          valorFim: null,
          taxa: 2.0,
          usuarioCriacao: defaultUser,
          participanteTaxaTipo: rateTypeEnum.antecipacao,
          ...timestamp
        }
      ],
      [ // Participante 2
        {
          participanteId: null,
          valorInicio: 0,
          valorFim: 1000,
          taxa: 5.0,
          usuarioCriacao: 'admin',
          participanteTaxaTipo: rateTypeEnum.cessao,
          ...timestamp
        },
        {
          participanteId: null,
          valorInicio: null,
          valorFim: null,
          taxa: 2.0,
          usuarioCriacao: 'admin',
          participanteTaxaTipo: rateTypeEnum.antecipacao,
          ...timestamp
        },
      ]
    ];

    const domiciliosBancarios = [
      [
        // Participante 1
      ],
      [ // Participante 2
        {
          participanteId: null,
          bandeiraId: null,
          bancoId: banco.id,
          bancoNome: banco.text,
          agencia: '6712',
          conta: '871',
          digito: '0',
          arquivo: 'fornecedor/32608796000156/extratosBancarios/2018-10-31T14-53-09-039Z/extrato.pdf',
          ...timestamp
        },
        {
          participanteId: null,
          bandeiraId: null,
          bancoId: banco.id,
          bancoNome: banco.text,
          agencia: '6712',
          conta: '871',
          digito: '0',
          arquivo: 'fornecedor/32608796000156/extratosBancarios/2018-10-31T14-53-09-039Z/extrato.pdf',
          ...timestamp
        },
        {
          participanteId: null,
          bandeiraId: null,
          bancoId: banco.id,
          bancoNome: banco.text,
          agencia: '6712',
          conta: '871',
          digito: '0',
          arquivo: 'fornecedor/32608796000156/extratosBancarios/2018-10-31T14-53-09-039Z/extrato.pdf',
          ...timestamp
        },
        {
          participanteId: null,
          bandeiraId: null,
          bancoId: banco.id,
          bancoNome: banco.text,
          agencia: '6712',
          conta: '871',
          digito: '0',
          arquivo: 'fornecedor/32608796000156/extratosBancarios/2018-10-31T14-53-09-039Z/extrato.pdf',
          ...timestamp
        },
      ]
    ];

    const socios = [[
      {
        participanteId: null,
        tipoPessoa: tiposPessoa.fisica,
        documento: '95015328010',
        nome: 'Matthew Mercer',
        aberturaNascimento: new Date('1982-06-29'),
        email: 'matthew.mercer@itlab.com.br',
        telefone: '1134897010',
        participacao: 50,
        celular: '11919371452',
        contato: true,
        ...timestamp
      },
      {
        participanteId: null,
        tipoPessoa: tiposPessoa.fisica,
        documento: '99097195098',
        nome: 'Keanu Reeves',
        aberturaNascimento: new Date('1964-09-02'),
        email: 'keanu.reeves@itlab.com.br',
        telefone: '1124055918',
        participacao: 50,
        celular: '11998347613',
        contato: true,
        ...timestamp
      },
    ]];

    const [
      cidades,
      bandeiras
    ] = (await Promise.all([
      sequelize.query(
        'SELECT id FROM "cidade" LIMIT 1;',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT id FROM "bandeira" LIMIT 4;',
        { type: sequelize.QueryTypes.SELECT }
      ),
    ])) as any[][];

    const cidadeId = cidades[0].id;

    participantes.forEach((c) => {
      c.arquivos = (JSON.stringify(c.arquivos) as any);
      c.cidadeId = cidadeId;
    });

    const inserted = (await queryInterface.bulkInsert('participante', participantes, { returning: true })) as any[];

    contatos.forEach((c, i) => {
      c.participanteId = inserted[i].id;
    });

    const dataTaxas = taxas.reduce((acc, curr, i) => {
      return acc.concat(curr.map((c) => {
        c.participanteId = inserted[i].id;
        return c;
      }));
    },                             []);

    const dataSocios = socios.reduce((acc, curr, i) => {
      return acc.concat(curr.map((c) => {
        c.participanteId = inserted[i].id;
        return c;
      }));
    },                               []);

    const dataDomicilios = domiciliosBancarios.reduce((acc, curr, i) => {
      return acc.concat(curr.map((c, index) => {
        c.participanteId = inserted[i].id;
        c.bandeiraId = bandeiras[index].id;
        return c;
      }));
    },                                                []);

    const participantesEstabelecimento = [];
    const participantesFornecedor = [];

    tiposParticipante.forEach((t, i) => {
      const data = {
        participanteId: inserted[i].id,
        ...timestamp
      };
      const destination = t === TipoParticipante.ec
        ? participantesEstabelecimento
        : participantesFornecedor;

      destination.push(data);
    });

    return Promise.all([
      queryInterface.bulkInsert('participanteContato', contatos, {}),
      queryInterface.bulkInsert('participanteTaxa', dataTaxas, {}),
      queryInterface.bulkInsert('participanteSocio', dataSocios, {}),
      queryInterface.bulkInsert('participanteDomicilioBancario', dataDomicilios, {}),
      queryInterface.bulkInsert('participanteEstabelecimento', participantesEstabelecimento, {}),
      queryInterface.bulkInsert('participanteFornecedor', participantesFornecedor, {}),

    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('participanteFornecedor', null, {}),
      queryInterface.bulkDelete('participanteEstabelecimento', null, {}),
      queryInterface.bulkDelete('participanteDomicilioBancario', null, {}),
      queryInterface.bulkDelete('participanteSocio', null, {}),
      queryInterface.bulkDelete('participanteTaxa', null, {}),
      queryInterface.bulkDelete('participanteContato', null, {}),
      queryInterface.bulkDelete('participanteAceiteTermo', null, {}),
      queryInterface.bulkDelete('participanteHistorico', null, {}),
      queryInterface.bulkDelete('participanteTaxaHistorico', null, {}),
      queryInterface.bulkDelete('credenciamentoProposta', null, {})
    ]);
    return queryInterface.bulkDelete('participante', null, {});
  }
};
