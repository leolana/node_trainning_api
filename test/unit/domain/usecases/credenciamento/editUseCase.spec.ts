import { DateTime } from 'luxon';

import database from '../../../../support/database';
import editUseCase from '../../../../../src/domain/usecases/credenciamento/editUseCase';

import credenciamentoStatusEnum from '../../../../../src/domain/entities/credenciamentoStatusEnum';

describe('Domain :: UseCases :: Credenciamento :: Edit', () => {

  const logger: any = {
    error: () => 0
  };

  const files = null;
  const documento = '46889297814';
  const user = 'alpe@alpe.com.br';
  const unchangedFilesInitial = null;

  const aberturaNascimentoFake = {
    year: 1998,
    month: 4,
    day: 29
  };

  const domiciliosBancarios = [
    {
      bandeira: {
        id: 1
      },
      banco: {
        id: 1,
        text: 'Banco Itaú'
      },
      agencia: '123456',
      conta: '123456',
      digito: '1'
    },
    {
      bandeira: {
        id: 1
      },
      banco: {
        id: 1,
        text: 'Banco Itaú'
      },
      agencia: '123456',
      conta: '123456',
      digito: '1'
    },
    {
      bandeira: {
        id: 1
      },
      banco: {
        id: 1,
        text: 'Banco Itaú'
      },
      agencia: '123456',
      conta: '123456',
      digito: '1'
    },
    {
      bandeira: {
        id: 1
      },
      banco: {
        id: 1,
        text: 'Banco Itaú'
      },
      agencia: '123456',
      conta: '123456',
      digito: '1'
    }
  ];

  const capturas = [
    {
      id: 1,
      quantidade: 1,
      valor: 55.00,
    },
    {
      id: 2,
      quantidade: 5,
      valor: 65.00,
    }
  ];

  const taxasAdministrativas = [
    {
      id: 1,
      valor: 1.8
    },
    {
      id: 2,
      valor: 1.5
    },
    {
      id: 3,
      valor: 0.9
    }
  ];

  const taxasDebito = [
    {
      id: 1,
      valor: 0.5,
    },
    {
      id: 2,
      valor: 0.6
    }
  ];

  const credenciamento: any = {
    documento,
    nome: 'Alexandre Pereira',
    tipoPessoa: 1,
    ramoAtividadeCodigo: 752,
    aberturaNascimento:
      DateTime.local(
        aberturaNascimentoFake.year,
        aberturaNascimentoFake.month,
        aberturaNascimentoFake.day
      ).toISO(),
    telefone: '1334675232',
    cep: '1111111',
    logradouro: 'Rua Tabapuã',
    complemento: '',
    numero: '145',
    bairro: 'Itaim Bibi',
    cidadeId: '10',
    faturamentoCartaoId:
      2,
    ticketMedioId:
      1,
    ecommerce: '',
    usuario: user,
    dadosCadastrais: {
      id: 1
    },
    domiciliosBancarios: domiciliosBancarios.map(t => ({
      bandeiraId: +t.bandeira.id,
      bancoId: t.banco.id,
      bancoNome: t.banco.text,
      agencia: t.agencia,
      conta: t.conta,
      digito: t.digito,
    })),
    capturas: capturas.map(t => ({
      capturaId: +t.id,
      quantidade: +t.quantidade,
      valor: t.valor,
    })),
    instalacao: { cidadeId: 11 },
    contato: {
      nome: 'Ademar de Barros',
      email: 'ademar@alpe.com.br',
      telefone: '1158634685',
      celular: '11978465231',
    },
    taxaContratualId: 3,
    condicaoComercial: {
      taxaContratual: {},
      antecipacao: {},
      taxasDebito:
        taxasDebito.map(t => ({
          taxaBandeiraId: t.id,
          valor: t.valor,
        })),
      taxasAdministrativas:
        taxasAdministrativas.map(t => ({
          taxaAdministrativaId: t.id,
          valor: t.valor
        }))
    },
    socios: [],
    historicoAprovacao: [{
      status: credenciamentoStatusEnum.aprovado,
      usuario: user,
      observacao: '',
    }],
    arquivos: {
      extratosBancarios: [],
      analises: [],
    }
  };

  database.transaction = async () => ({
    rollback: async () => null,
    commit: async () => null
  });

  const services = {
    mutateService: () => Promise.resolve([{ id: 1 }]),
    approveService: () => Promise.resolve(credenciamento),
    findService: () => Promise.resolve({
      taxaContratual: {
        antecipacao: {}
      }
    })
  };

  const credenciamentoEditUseCases: any = {
    findAccreditationParticipant: async () => ({
      participanteExistente: {
        domiciliosBancarios: []
      },
      credenciamentoAnterior: Object.assign(credenciamento, {
        status: credenciamentoStatusEnum.aprovado,
        documento: '46889297814',
        arquivos: {},
        update: async () => null
      }),
    }),
    setAccreditationNewRateValues: async () => false,
    validateAccreditationBeforeEdit: async () => null,
    inactivatePreviousAccreditation: async () => null,
    updateParticipantRate: async () => null,
    checkIfBankingDataChanged: async () => false
  };

  test('Should edit an accreditation', async (done) => {
    const edit = editUseCase(database, logger, credenciamentoEditUseCases, services);
    const result = await edit(credenciamento, files, documento, user, unchangedFilesInitial);
    expect(result.nome).toBe(credenciamento.nome);
    done();
  });

});
