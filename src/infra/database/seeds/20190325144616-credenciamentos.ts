// tslint:disable: no-magic-numbers
import { QueryInterface } from 'sequelize';

import { defaultUser } from '../consts';
import credenciamentoStatusEnum from '../../../domain/entities/credenciamentoStatusEnum';
import tiposPessoa from '../../../domain/entities/tiposPessoa';

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const sequelize = queryInterface.sequelize;

    const now = new Date();
    const timestamp = { createdAt: now, updatedAt: now };

    const ramoAtividadeCodigo = 742;
    const prazoTaxa = 33;
    const banco = { id: '246', text: 'Banco ABC Brasil S.A.' };

    const credenciamentos = [{
      ramoAtividadeCodigo,
      cidadeId : null,
      taxaContratualId : null,
      faturamentoCartaoId: null,
      ticketMedioId: null,
      nome: 'It Lab',
      tipoPessoa: tiposPessoa.juridica,
      documento: '01510345000158',
      aberturaNascimento: new Date(2002, 1, 15),
      telefone: '1111223344',
      cep: '04533010',
      logradouro: 'Rua Tabapuã',
      numero: '145',
      complemento: 'bloco unico',
      bairro: 'Itaim Bibi',
      ecommerce: 'www.itlab.com.br',
      usuario: defaultUser,
      razaoSocial: 'It Lab Consultoria e Desenvolvimento de Sistemas LTDA.',
      inscricaoEstadual: '287.046.269.490',
      inscricaoMunicipal: '227.616.175.362',
      taxaAdesao: 250.00,
      arquivos: {
        contratoSocial:
          'credenciamento/01510345000158/contratoSocial/2018-10-31T14-53-09-039Z/contrato.pdf',
        analises: [],
      },
      ...timestamp
    }];

    const instalacoes = [{
      credenciamentoId: null,
      cidadeId: null,
      cep: '04533010',
      logradouro: 'Rua Tabapuã',
      numero: '145',
      complemento: 'bloco unico',
      bairro: 'Itaim Bibi',
      dias: 1,
      horario: 1,
      nome: 'Matthew Mercer',
      email: 'matthew.mercer@itlab.com.br',
      telefone: '1134897010',
      celular: '11919371452',
      ...timestamp
    }];

    const contatos = [{
      credenciamentoId: null,
      nome: 'Wilfrid Luettgen',
      email: 'gabriel.lima@itlab.com.br',
      telefone: '1175378173',
      celular: '11971528763',
      ...timestamp
    }];

    const capturas = [[
      {
        credenciamentoId: null,
        capturaId: null,
        quantidade: 2,
        valor: 55.0,
        ...timestamp
      },
      {
        credenciamentoId: null,
        capturaId: null,
        quantidade: 1,
        valor: 55.00,
        ...timestamp
      },
    ]];

    const domiciliosBancarios = [[
      {
        credenciamentoId: null,
        bandeiraId: null,
        bancoId: banco.id,
        bancoNome: banco.text,
        agencia: '123',
        conta: '123',
        digito: '1',
        arquivo: 'credenciamento/01510345000158/extratosBancarios/2018-10-31T14-53-09-039Z/extrato.pdf',
        ...timestamp
      },
      {
        credenciamentoId: null,
        bandeiraId: null,
        bancoId: banco.id,
        bancoNome: banco.text,
        agencia: '123',
        conta: '123',
        digito: '1',
        arquivo: 'credenciamento/01510345000158/extratosBancarios/2018-10-31T14-53-09-039Z/extrato.pdf',
        ...timestamp
      },
      {
        credenciamentoId: null,
        bandeiraId: null,
        bancoId: banco.id,
        bancoNome: banco.text,
        agencia: '123',
        conta: '123',
        digito: '1',
        arquivo: 'credenciamento/01510345000158/extratosBancarios/2018-10-31T14-53-09-039Z/extrato.pdf',
        ...timestamp
      },
      {
        credenciamentoId: null,
        bandeiraId: null,
        bancoId: banco.id,
        bancoNome: banco.text,
        agencia: '123',
        conta: '123',
        digito: '1',
        arquivo: 'credenciamento/01510345000158/extratosBancarios/2018-10-31T14-53-09-039Z/extrato.pdf',
        ...timestamp
      },
    ]];

    const historicoAprovacoes = [
      {
        credenciamentoId: null,
        status: credenciamentoStatusEnum.pendente,
        usuario: defaultUser,
        observacao: '',
        ...timestamp
      },
    ];

    const socios = [[
      {
        credenciamentoId: null,
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
        credenciamentoId: null,
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
      taxasBandeira,
      taxasPrazo,
      cidades,
      faturamentos,
      tickets,
      taxasContratuais,
      capturaProdutos,
      bandeiras
    ] = (await Promise.all([
      sequelize.query(
        'SELECT id, "taxaDebito" FROM "taxaBandeira";',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT a.id, p.coeficiente, a."valorBase" FROM "taxaPrazo" '
        + 'p INNER JOIN "taxaAdministrativa" a ON a."taxaPrazoId" = p.id WHERE prazo = ?;',
        {
          replacements: [prazoTaxa],
          type: sequelize.QueryTypes.SELECT
        }
      ),
      sequelize.query(
        'SELECT id FROM "cidade" LIMIT 1;',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT id FROM "faturamentoCartao" LIMIT 1;',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT id FROM "ticketMedio" LIMIT 1;',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT id FROM "taxaContratual" LIMIT 1;',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT id FROM "captura" LIMIT 2;',
        { type: sequelize.QueryTypes.SELECT }
      ),
      sequelize.query(
        'SELECT id FROM "bandeira" LIMIT 4;',
        { type: sequelize.QueryTypes.SELECT }
      ),
    ])) as any[][];

    const cidadeId = cidades[0].id;
    const faturamentoId = faturamentos[0].id;
    const ticketId = tickets[0].id;
    const taxaContratualId = taxasContratuais[0].id;

    const taxasDebito = taxasBandeira.map(t => ({
      credenciamentoId: null,
      taxaBandeiraId: t.id,
      valor: t.taxaDebito,
      ...timestamp
    }));

    const taxasAdministrativas = taxasPrazo.map(p => ({
      credenciamentoId: null,
      taxaAdministrativaId: p.id,
      valor: p.valorBase + p.coeficiente,
      ...timestamp
    }));

    credenciamentos.forEach((c) => {
      c.arquivos = (JSON.stringify(c.arquivos) as any);
      c.cidadeId = cidadeId;
      c.faturamentoCartaoId = faturamentoId;
      c.ticketMedioId = ticketId;
      c.taxaContratualId = taxaContratualId;
    });

    const inserted = (await queryInterface.bulkInsert('credenciamento', credenciamentos, { returning: true })) as any[];

    instalacoes.forEach((inst, i) => {
      inst.credenciamentoId = inserted[i].id;
      inst.cidadeId = cidadeId;
    });

    contatos.forEach((c, i) => {
      c.credenciamentoId = inserted[i].id;
    });

    historicoAprovacoes.forEach((h, i) => {
      h.credenciamentoId = inserted[i].id;
    });

    const dataCapturas = capturas.reduce((acc, curr, i) => {
      return acc.concat(curr.map((c) => {
        c.credenciamentoId = inserted[i].id;
        c.capturaId = capturaProdutos[i].id;
        return c;
      }));
    },                                   []);

    const dataSocios = socios.reduce((acc, curr, i) => {
      return acc.concat(curr.map((c) => {
        c.credenciamentoId = inserted[i].id;
        return c;
      }));
    },                               []);

    const dataDomicilios = domiciliosBancarios.reduce((acc, curr, i) => {
      return acc.concat(curr.map((c, index) => {
        c.credenciamentoId = inserted[i].id;
        c.bandeiraId = bandeiras[index].id;
        return c;
      }));
    },                                                []);

    const dataTaxasDebito = taxasDebito.reduce((acc, curr) => {
      return acc.concat(inserted.map((i) => {
        curr.credenciamentoId = i.id;
        return curr;
      }));
    },                                         []);

    const dataTaxasAdministrativas = taxasAdministrativas.reduce((acc, curr) => {
      return acc.concat(inserted.map((i) => {
        curr.credenciamentoId = i.id;
        return curr;
      }));
    },                                                           []);

    return Promise.all([
      queryInterface.bulkInsert('credenciamentoInstalacao', instalacoes, {}),
      queryInterface.bulkInsert('credenciamentoContato', contatos, {}),
      queryInterface.bulkInsert('credenciamentoAprovacao', historicoAprovacoes, {}),
      queryInterface.bulkInsert('credenciamentoCaptura', dataCapturas, {}),
      queryInterface.bulkInsert('credenciamentoSocio', dataSocios, {}),
      queryInterface.bulkInsert('credenciamentoTaxaAdministrativa', dataTaxasAdministrativas, {}),
      queryInterface.bulkInsert('credenciamentoTaxaDebito', dataTaxasDebito, {}),
      queryInterface.bulkInsert('credenciamentoDomicilioBancario', dataDomicilios, {}),
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    await Promise.all([
      queryInterface.bulkDelete('credenciamentoDomicilioBancario', null, {}),
      queryInterface.bulkDelete('credenciamentoTaxaDebito', null, {}),
      queryInterface.bulkDelete('credenciamentoTaxaAdministrativa', null, {}),
      queryInterface.bulkDelete('credenciamentoSocio', null, {}),
      queryInterface.bulkDelete('credenciamentoCaptura', null, {}),
      queryInterface.bulkDelete('credenciamentoAprovacao', null, {}),
      queryInterface.bulkDelete('credenciamentoContato', null, {}),
      queryInterface.bulkDelete('credenciamentoInstalacao', null, {})
    ]);
    return queryInterface.bulkDelete('credenciamento', null, {});
  }
};
