import dataFaker from '../../dataFaker';

const credenciamentoFactory = (factory) => {
  return factory.define('credenciamento', {
    id: 1,
    tipoPessoa: dataFaker.integer(),
    ramoAtividadeCodigo: dataFaker.integer(),
    documento: '00000000000000',
    nome: dataFaker.name(),
    aberturaNascimento: '2019-03-06T00:00:00.000-03:00',
    telefone: dataFaker.string({ length: 10 }),
    cep: dataFaker.string({ length: 8 }),
    logradouro: dataFaker.string({ length: 200 }),
    numero: dataFaker.string({ length: 15 }),
    complemento: dataFaker.string({ length: 50 }),
    bairro: dataFaker.string({ length: 100 }),
    cidadeId: dataFaker.integer(),
    razaoSocial: dataFaker.string({ length: 100 }),
    inscricaoEstadual: dataFaker.string({ length: 15 }),
    inscricaoMunicipal: dataFaker.string({ length: 15 }),
    faturamentoCartaoId: 1,
    ticketMedioId: 2,
    ecommerce: dataFaker.string({ length: 255 }),
    taxaContratualId: 1,
    taxaAdesao: 250,
    arquivos: [{
      analises: [],
      contratoSocial: 'credenciamento/01510345000158/contratoSocial/2019-03-27T21-55-25-774Z/arquivo.txt',
      extratosBancarios: ['credenciamento/01510345000158/extratosBancarios/2019-03-27T21-56-03-057Z/arquivo.txt']
    }],
    status: dataFaker.integer(),
    ativo: dataFaker.bool(),
    usuario: dataFaker.string({ length: 100 }),
    participanteId: dataFaker.integer(),
    contato:
    {
      credenciamentoId: 1,
      nome: dataFaker.name(),
      email: dataFaker.email(),
      telefone: dataFaker.string({ length: 10 }),
      celular: dataFaker.string({ length: 11 }),
    },
    socios: [
      {
        id: 1,
        credenciamentoId: 1,
        tipoPessoa: 2,
        documento: dataFaker.string({ length: 18 }),
        nome: dataFaker.string({ length: 100 }),
        aberturaNascimento: '2019-03-06T00:00:00.000-03:00',
        email: dataFaker.string({ length: 200 }),
        telefone: dataFaker.string({ length: 10 }),
        participacao: dataFaker.floating({ min: 1, max: 100, fixed: 2 }),
        celular: dataFaker.string({ length: 11 }),
        contato: dataFaker.bool(),
        razaoSocial: dataFaker.string({ length: 100 }),
        inscricaoEstadual: dataFaker.string({ length: 50 }),
        inscricaoMunicipal: dataFaker.string({ length: 50 }),
      }
    ],
    domiciliosBancarios: [
      {
        credenciamentoId: 1,
        bandeiraId: 1,
        bancoId: dataFaker.string({ length: 3 }),
        bancoNome: dataFaker.string({ length: 50 }),
        agencia: dataFaker.string({ length: 5 }),
        conta: dataFaker.string({ length: 10 }),
        digito: dataFaker.string({ length: 1 }),
      },
      {
        credenciamentoId: 1,
        bandeiraId: 2,
        bancoId: dataFaker.string({ length: 3 }),
        bancoNome: dataFaker.string({ length: 50 }),
        agencia: dataFaker.string({ length: 5 }),
        conta: dataFaker.string({ length: 10 }),
        digito: dataFaker.string({ length: 1 }),
      },
      {
        credenciamentoId: 1,
        bandeiraId: 3,
        bancoId: dataFaker.string({ length: 3 }),
        bancoNome: dataFaker.string({ length: 50 }),
        agencia: dataFaker.string({ length: 5 }),
        conta: dataFaker.string({ length: 10 }),
        digito: dataFaker.string({ length: 1 }),
      },
      {
        credenciamentoId: 1,
        bandeiraId: 4,
        bancoId: dataFaker.string({ length: 3 }),
        bancoNome: dataFaker.string({ length: 50 }),
        agencia: dataFaker.string({ length: 5 }),
        conta: dataFaker.string({ length: 10 }),
        digito: dataFaker.string({ length: 1 }),
      }],
    instalacao:
    {
      credenciamentoId: 1,
      cep: dataFaker.string({ length: 8 }),
      logradouro: dataFaker.string({ length: 200 }),
      numero: dataFaker.string({ length: 15 }),
      complemento: dataFaker.string({ length: 50 }),
      bairro: dataFaker.string({ length: 100 }),
      cidadeId: dataFaker.integer(),
      pontoReferencia: dataFaker.string({ length: 100 }),
      dias: dataFaker.integer(),
      horario: dataFaker.integer(),
      nome: dataFaker.name(),
      email: dataFaker.email(),
      telefone: dataFaker.string({ length: 10 }),
      celular: dataFaker.string({ length: 11 }),
    },
    participante: {
      id: 4,
      integracoes: [],
    },
    captura: {
      capturas: [{
        credenciamentoId: 1,
        capturaId: 1,
        quantidade: dataFaker.integer(),
        valor: 230.00,
      }]
    },

    taxaContratual:
    {
      id: 1,
      antecipacaoOriginal: 1.8,
      antecipacao: 1.8,
      adesao: 250,
      maximoParcelas: 12
    },
    taxasDebito: [
      {
        credenciamentoId: 1,
        taxaBandeiraId: 1,
        valor: dataFaker.floating({ fixed: 2 })
      },
      {
        credenciamentoId: 1,
        taxaBandeiraId: 2,
        valor: dataFaker.floating({ fixed: 2 })
      },
      {
        credenciamentoId: 1,
        taxaBandeiraId: 3,
        valor: dataFaker.floating({ fixed: 2 })
      },
      {
        credenciamentoId: 1,
        taxaBandeiraId: 4,
        valor: dataFaker.floating({ fixed: 2 })
      }
    ],
    taxasAdministrativas: [
      {
        credenciamentoId: 1,
        taxaAdministrativaId: 1,
        valor: dataFaker.floating({ min: 0, max: 10, fixed: 2 }),
      },
      {
        credenciamentoId: 1,
        taxaAdministrativaId: 1,
        valor: dataFaker.floating({ min: 0, max: 10, fixed: 2 }),
      },
    ]
  });
};

export default credenciamentoFactory;
