import { DateTime } from 'luxon';

import credenciamentoStatusEnum from '../../../../src/domain/entities/credenciamentoStatusEnum';

const aberturaNascimentoFake = {
  year: 1998,
  month: 4,
  day: 29
};

const arquivos = [{
  fieldname: 'contratoSocial',
  originalname: 'folder.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  size: 171545
}];

const participanteFactory = (factory) => {
  return factory.define('participante', {
    arquivos,
    tipoPessoa: '1',
    ramoAtividadeCodigo: '752',
    documento: '46889297814',
    nome: 'Roberto Silva',
    aberturaNascimento: DateTime.local(
      aberturaNascimentoFake.year,
      aberturaNascimentoFake.month,
      aberturaNascimentoFake.day
    ).toISO(),
    telefone: '1334675232',
    cep: '1111111',
    logradouro: 'Rua Tabapuã',
    numero: '145',
    complemento: '',
    bairro: 'Itaim Bibi',
    cidadeId: '10',
    razaoSocial: 'ItLab desenvolvimento de software',
    inscricaoEstadual: 'ISENTO',
    inscricaoMunicipal: 'ISENTO',
    ativo: true,
    usuario: 'alpe@alpe.com.br',
    credenciamentos: [
      {
        id: 1,
        status: credenciamentoStatusEnum.aprovado,
        documento: '46889297814',
        arquivos: {
          analises: ''
        },
        taxaContratualId: 1,
        taxasDebito: [
          {
            id: 1,
            valor: 0.5,
          },
          {
            id: 2,
            valor: 0.6
          }
        ],
        taxasAdministrativas: [
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
        ],
        update: () => null
      }
    ],
    domiciliosBancarios: [
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
    ],
  });
};

export default participanteFactory;
