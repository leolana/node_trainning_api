import database from '../../../../support/database';

import exportCSV from '../../../../../src/domain/usecases/credenciamento/exportCSV';

interface CSVField {
  type: string;
  required?: boolean;
  name?: string;
  length?: number;
  pattern?: RegExp;
  validator?: (str: string) => boolean;
}

describe('Domain :: UseCases :: Credenciamento :: ExportCSV', () => {
  const noSpecialCharacters = (str: string) => {
    return !/[^a-zA-Z0-9 ]/g.test(str.replace(/[\u0300-\u036f]/g, ''));
  };

  const urlTest = /https?:\/\//;

  const dateTest = /[0-9][0-9]\/[0-9][0-9]\/[0-9][0-9][0-9][0-9]/;

  // Ordem e campos não podem ser alterados, por estarem em conformidade com o layout da Global.
  const schema: CSVField[] = [
    { type: 'number', length: 14 },
    { type: 'string', length: 2, pattern: /(PF|PJ)/ },
    { type: 'string', length: 100, validator: noSpecialCharacters },
    { type: 'string', length: 100, validator: noSpecialCharacters },
    { type: 'number', length: 100 },
    { type: 'string', length: 300 },
    { type: 'number', length: 8 },
    { type: 'string', length: 60, validator: noSpecialCharacters },
    { type: 'number', length: 9 },
    { type: 'string', length: 50 },
    { type: 'string', length: 50 },
    { type: 'string', length: 50 },
    { type: 'string', length: 30 },
    { type: 'number', length: 20 },
    { type: 'number', length: 20 },
    { type: 'number', length: 20 },
    { type: 'number', length: 20 },
    { type: 'string', length: 100 },
    { type: 'number', length: 8 },
    { type: 'string', length: 60, validator: noSpecialCharacters },
    { type: 'number', length: 9 },
    { type: 'string', length: 50 },
    { type: 'string', length: 50 },
    { type: 'string', length: 50 },
    { type: 'string', length: 30 },
    { type: 'string', length: 100 },
    { type: 'number', length: 11 },
    { type: 'string', pattern: dateTest },
    { type: 'number', length: 2, pattern: /[0-6]/ },
    { type: 'string', pattern: dateTest },
    { type: 'string', length: 100 },
    { type: 'string', length: 100 },
    { type: 'string', length: 256, pattern: urlTest },
    { type: 'string', length: 256, pattern: urlTest },
    { type: 'string', length: 256 },
    { type: 'number', length: 11 },
    { type: 'number', length: 6 },
    { type: 'number', length: 1 },
    { type: 'number', length: 11 },
    { type: 'string', length: 100 },
    { type: 'number', length: 11 },
    { type: 'number', length: 6 },
    { type: 'number', length: 1 },
    { type: 'number', length: 11 },
    { type: 'string', length: 100 },
    { type: 'number', length: 11 },
    { type: 'number', length: 11 },
    { type: 'number', length: 2 }
  ];

  database.entities.credenciamento.findAll = async () => ([{
    id: 1,
    tipoPessoa: 2,
    ramoAtividadeCodigo: 742,
    documento: '01510345000158',
    nome: 'It Lab',
    aberturaNascimento: '2002-02-15',
    telefone: '1111223344',
    cep: '04533010',
    logradouro: 'Rua Tabapuã',
    numero: '145',
    complemento: 'bloco unico',
    bairro: 'Itaim Bibi',
    cidadeId: 1,
    razaoSocial: 'It Lab Consultoria e Desenvolvimento de Sistemas LTDA.',
    inscricaoEstadual: '287.046.269.490',
    inscricaoMunicipal: '227.616.175.362',
    faturamentoCartaoId: 1,
    ticketMedioId: 1,
    ecommerce: 'www.itlab.com.br',
    taxaContratualId: 1,
    arquivos: [{
      analises: [],
      contratoSocial: 'credenciamento/01510345000158/contratoSocial/2019-03-27T21-55-25-774Z/arquivo.txt',
      extratosBancarios: ['credenciamento/01510345000158/extratosBancarios/2019-03-27T21-56-03-057Z/arquivo.txt']
    }],
    status: 3,
    ativo: true,
    usuario: 'admin',
    participanteId: 3,
    createdAt: '2019-03-29 15:57:36',
    cidade: {
      id: 1,
      nome: 'Santos',
      createdAt: '2019-03-29 15:57:36',
      updatedAt: '2019-03-29 15:57:36'
    },
    ramoAtividade: {
      codigo: 742,
      descricao: 'Veterinaria',
      restritoPJ: false,
      ativo: true,
      departamento: 2,
      createdAt: '2019-03-29 15:57:36',
      updatedAt: '2019-03-29 15:57:36'
    },
    instalacao: {
      id: 1,
      credeciamentoId: 1,
      cep: '04533010',
      logradouro: 'Rua Tabapuã',
      numero: '145',
      complemento: 'bloco unico',
      bairro: 'Itaim Bibi',
      cidadeId: 1,
      pontoReferencia: null,
      dias: 1,
      horario: 1,
      nome: 'Matthew Mercer',
      telefone: '1134897010',
      celular: '11919371452',
      createdAt: '2019-03-29 15:57:36',
      updatedAt: '2019-03-29 15:57:36',
      cidade: {
        id: 1,
        nome: 'Santos',
        createdAt: '2019-03-29 15:57:36',
        updatedAt: '2019-03-29 15:57:36'
      }
    },
    contato: {
      id: 1,
      credenciamentoId: 1,
      nome: 'Wilfrid Luettgen',
      email: 'gabriel.lima@itlab.com.br',
      telefone: '1175378173',
      celular: '11971528763',
      createdAt: '2019-03-29 15:57:36',
      updatedAt: '2019-03-29 15:57:36'
    },
    socios: [
      {
        id: 1,
        credenciamentoId: 1,
        tipoPessoa: 1,
        documento: '95015328010',
        nome: 'Matthew Mercer',
        aberturaNascimento: '1982-06-29',
        email: 'matthew.mercer@itlab.com.br',
        telefone: '1134897010',
        participacao: 50,
        celular: '11919371452',
        contato: true,
        razaoSocial: null,
        inscricaoEstadual: null,
        inscricaoMunicipal: null,
        createdAt: '2019-03-29 15:57:36',
        updatedAt: '2019-03-29 15:57:36'
      },
      {
        id: 2,
        credenciamentoId: 1,
        tipoPessoa: 1,
        documento: '99097195098',
        nome: 'Keanu Reeves',
        aberturaNascimento: '1964-09-02',
        email: 'keanu.reever@itlab.com.br',
        telefone: '1124055918',
        participacao: 50,
        celular: '11998347613',
        contato: true,
        razaoSocial: null,
        inscricaoEstadual: null,
        inscricaoMunicipal: null,
        createdAt: '2019-03-29 15:57:36',
        updatedAt: '2019-03-29 15:57:36'
      }
    ],
    domiciliosBancarios: [
      {
        id: 1,
        credenciamentoId: 1,
        bandeiraId: 1,
        bancoId: '246',
        bancoNome: 'Banco ABC Brasil S.A.',
        agencia: '123',
        conta: '123',
        digito: '1',
        createdAt: '2019-03-29 15:57:36',
        updatedAt: '2019-03-29 15:57:36',
        bandeira: {
          id: 1,
          nome: 'Mastercard',
          ativo: true,
          createdAt: '2019-03-29 15:57:36',
          updatedAt: '2019-03-29 15:57:36'
        }
      },
      {
        id: 2,
        credenciamentoId: 1,
        bandeiraId: 1,
        bancoId: '246',
        bancoNome: 'Banco ABC Brasil S.A.',
        agencia: '123',
        conta: '123',
        digito: '1',
        createdAt: '2019-03-29 15:57:36',
        updatedAt: '2019-03-29 15:57:36',
        bandeira: {
          id: 1,
          nome: 'Mastercard',
          ativo: true,
          createdAt: '2019-03-29 15:57:36',
          updatedAt: '2019-03-29 15:57:36'
        }
      },
      {
        id: 3,
        credenciamentoId: 1,
        bandeiraId: 1,
        bancoId: '246',
        bancoNome: 'Banco ABC Brasil S.A.',
        agencia: '123',
        conta: '123',
        digito: '1',
        createdAt: '2019-03-29 15:57:36',
        updatedAt: '2019-03-29 15:57:36',
        bandeira: {
          id: 1,
          nome: 'Mastercard',
          ativo: true,
          createdAt: '2019-03-29 15:57:36',
          updatedAt: '2019-03-29 15:57:36'
        }
      },
      {
        id: 4,
        credenciamentoId: 1,
        bandeiraId: 1,
        bancoId: '246',
        bancoNome: 'Banco ABC Brasil S.A.',
        agencia: '123',
        conta: '123',
        digito: '1',
        createdAt: '2019-03-29 15:57:36',
        updatedAt: '2019-03-29 15:57:36',
        bandeira: {
          id: 1,
          nome: 'Mastercard',
          ativo: true,
          createdAt: '2019-03-29 15:57:36',
          updatedAt: '2019-03-29 15:57:36'
        }
      }
    ],
    capturas: [
      {
        id: 1,
        credenciamento: 1,
        capturaId: 1,
        quantidade: 2,
        createdAt: '2019-03-29 15:57:36',
        updatedAt: '2019-03-29 15:57:36',
        captura: {
          id: 1,
          produtoId: 1,
          inicio: '2019-03-29',
          fim: null,
          tipoCaptura: 1,
          valor: 55,
          usuario: 'admin',
          createdAt: '2019-03-29 15:57:36',
          updatedAt: '2019-03-29 15:57:36',
          produto: {
            id: 1,
            nome: 'POS com fio',
            descricao: null,
            usuario: 'admin',
            ativo: true,
            codigo: 4,
            createdAt: '2019-03-29 15:57:36',
            updatedAt: '2019-03-29 15:57:36'
          }
        }
      },
      {
        id: 2,
        credenciamento: 1,
        capturaId: 2,
        quantidade: 2,
        createdAt: '2019-03-29 15:57:36',
        updatedAt: '2019-03-29 15:57:36',
        captura: {
          id: 2,
          produtoId: 2,
          inicio: '2019-03-29',
          fim: null,
          tipoCaptura: 1,
          valor: 75,
          usuario: 'admin',
          createdAt: '2019-03-29 15:57:36',
          updatedAt: '2019-03-29 15:57:36',
          produto: {
            id: 1,
            nome: 'POS sem fio',
            descricao: null,
            usuario: 'admin',
            ativo: true,
            codigo: 4,
            createdAt: '2019-03-29 15:57:36',
            updatedAt: '2019-03-29 15:57:36'
          }
        }
      }
    ]
  }]);

  test('Export all approved accreditations', async (done) => {
    const exportUseCase = exportCSV(database);

    const csv = await exportUseCase({});
    const row = csv.split('\n')[0];
    const test = row.split(';');

    expect(test).toHaveLength(schema.length);

    for (let i = 0; i < test.length; i += 1) {
      const value = test[i];
      const definition = schema[i];

      if (definition.required) {
        expect(value).toBeTruthy();
      }

      if (value) {
        const strValue = value.toString();

        if (definition.type === 'number') {
          expect(+strValue).not.toBeNaN();
        }

        if (definition.length) {
          expect(strValue.length).toBeLessThanOrEqual(definition.length);
        }

        if (definition.pattern) {
          expect(strValue).toMatch(definition.pattern);
        }

        if (definition.validator) {
          expect(definition.validator(strValue)).toBe(true);
        }
      }
    }

    done();
  });
});
