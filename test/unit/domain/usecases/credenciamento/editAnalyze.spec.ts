
import { DateTime } from 'luxon';
import database from '../../../../support/database';
import editAnalyze from '../../../../../src/domain/usecases/credenciamento/editAnalyze';
import { FileStorageDev } from '../../../../../src/infra/fileStorage';

const getData = () => ({
  tipoPessoa: 2,
  dadosCadastrais:
  {
    id: 1,
    nome: 'Teste Ec',
    documento: '00000000000000',
    tipo: 'Estabelecimento',
    ehFornecedor: false,
    ehEstabelecimento: true,
    tipoPessoa: 2,
    telefone: '1111111111',
    aberturaNascimento: '2019-03-06T00:00:00.000-03:00',
    dataAbertura: '2019-03-06T00:00:00.000-03:00',
    dataNascimento: '2019-03-06T00:00:00.000-03:00',
    cep: '07304111',
    logradouro: 'Rua Tabapuã',
    numero: '21',
    complemento: null,
    bairro: 'Itaim Bibi',
    estado: 'SP',
    uf: 'SP',
    razaoSocial: 'KG Menswear LTDA.',
    inscricaoEstadual: 'ISENTO',
    inscricaoMunicipal: 'ISENTO',
    ramoAtividade: '742',
    cidade: '3',
    informacoesFinanceiras: {
      faturamentoAnual: { id: 1, text: 'Até 100.000' },
      ticketMedio: { id: 2, text: 'Até R$ 50' }
    },
    contato:
    {
      nomeContato: 'teste ec',
      emailContato: 'ec@email',
      telefoneContato: '1111111111',
      celularContato: '11111111111'
    },
    socios: [
      {
        id: 1,
        aberturaNascimento: '2019-03-07T00:00:00.000-03:00',
        celular: '11111144444',
        contato: true,
        documento: '34356705092',
        email: 'email@socio',
        inscricaoEstadual: null,
        inscricaoMunicipal: null,
        nome: 'Fernanda Lima',
        participacao: 100,
        razaoSocial: 'Fernanda LTDA.',
        telefone: '1111111111',
        tipoPessoa: 1,
      }
    ],
    domiciliosBancarios: [
      {
        bandeira: { id: 1, text: 'Mastercard' }, banco: { id: 246, text: 'Banco ABC Brasil S.A.' },
        agencia: 534, conta: 54, digito: 5
      },
      {
        bandeira: { id: 2, text: 'Visa' }, banco: { id: 246, text: 'Banco ABC Brasil S.A.' },
        agencia: 534, conta: 54, digito: 5
      },
      {
        bandeira: { id: 3, text: 'Elo' }, banco: { id: 246, text: 'Banco ABC Brasil S.A.' },
        agencia: 534, conta: 54, digito: 5
      },
      {
        bandeira: { id: 4, text: 'Hipercard' }, banco: { id: 246, text: 'Banco ABC Brasil S.A.' },
        agencia: 534, conta: 54, digito: 5
      }]
  },
  instalacao:
  {
    cep: '07304111',
    logradouro: 'Rua Tabapuã',
    numero: '21',
    complemento: null,
    bairro: 'Itaim Bibi',
    cidade: 3,
    pontoReferencia: null,
    dias: 2,
    horario: '2',
    nome: 'teste ec',
    email: 'ec@email',
    telefone: '1111111111',
    celular: '11111111111'
  },
  captura: { capturas: [{ id: 1, quantidade: 54, valor: 250 }], url: '' },
  documentos: [
    {
      id: 'contratoSocial',
      arquivo: {},
      nomeArquivo: 'folder.pdf',
      tipoArquivo: 'application/pdf'
    },
    {
      id: 'extratosBancarios0',
      arquivo:
        'credenciamento/29990836000162/extratosBancarios/2019-03-28T20-10-44-220Z/extrato.gif'
    }],
  condicaoComercial:
  {
    taxaContratual:
    {
      id: 1,
      antecipacaoOriginal: 1.8,
      antecipacao: 1.8,
      adesao: 250,
      maximoParcelas: 12
    },
    taxasDebito: [
      { id: 1, idTaxaCredenciamento: 85, valor: 2.03, bandeira: { id: 1, text: 'Mastercard' } },
      { id: 3, idTaxaCredenciamento: 86, valor: 2.43, bandeira: { id: 3, text: 'Elo' } },
      { id: 2, idTaxaCredenciamento: 87, valor: 2.03, bandeira: { id: 2, text: 'Visa' } },
      { id: 4, idTaxaCredenciamento: 88, valor: 2.18, bandeira: { id: 4, text: 'Hipercard' } }
    ],
    taxasAdministrativas: [
      {
        id: 1, idTaxaCredenciamento: 253, valor: 4.31, bandeira: { id: 2, text: 'Visa' },
        prazo: 3, coeficiente: 1.8, opcoesParcelamento: { minimoParcelas: 1, maximoParcelas: 1 }
      },
      {
        id: 1, idTaxaCredenciamento: 254, valor: 4.71, bandeira: { id: 3, text: 'Elo' },
        prazo: 3, coeficiente: 1.8, opcoesParcelamento: { minimoParcelas: 1, maximoParcelas: 1 }
      },
    ]
  },
});

const arquivos = [{
  fieldname: 'contratoSocial',
  originalname: 'folder.pdf',
  encoding: '7bit',
  mimetype: 'application/pdf',
  size: 171545
}];
const editAnalyzeUseCase = editAnalyze(database, new FileStorageDev());

describe('Domain :: UseCases :: Account :: EditAnalyze', () => {
  test('EditAnalyze with data correct', async (done) => {
    const data = getData();
    const edited = await editAnalyzeUseCase(data, arquivos, '00000000000000', 'alpe@alpe.com');
    expect(Array.isArray(edited)).toBe(true);
    done();
  });

  test('EditAnalyze when accreditation doenst exist in factory should throw registro-nao-encontrado', () => {
    database.entities.credenciamento.findOne = async () => {
      return null;
    };
    const data = getData();
    const edited = editAnalyzeUseCase(data, arquivos, '00000000000000', 'alpe@alpe.com');

    return expect(edited).rejects.toThrowError('registro-nao-encontrado');

  });

  test(
    `EditAnalyze with document Number different document Number
      registered should throw documento-informado-diferente-do-existente`,
    () => {
      database.entities.credenciamento.findOne = async () => ({
        documento: '00000000000000'
      });
      const data = getData();

      const edited = editAnalyzeUseCase(data, arquivos, '46674116000107', 'alpe@alpe.com');

      return expect(edited).rejects.toThrowError('documento-informado-diferente-do-existente');
    });

  test('EditAnalyze with type person invalid should throw tipoPessoa-invalido', () => {
    const typePersonInvalid = 10;
    const data = getData();
    data.tipoPessoa = typePersonInvalid;
    const edited = editAnalyzeUseCase(data, arquivos, '00000000000000', 'alpe@alpe.com');
    return expect(edited).rejects.toThrowError('tipoPessoa-invalido');
  });

  test('EditAnalyze with Opening Birthday Date invalid should throw dataAberturaNascimento-invalida', () => {
    const tomorrow = DateTime.local().plus({ days: 1 }).toSQLDate();
    const data = getData();
    data.dadosCadastrais.aberturaNascimento = tomorrow;
    const edited = editAnalyzeUseCase(data, arquivos, '00000000000000', 'alpe@alpe.com');
    return expect(edited).rejects.toThrowError('dataAberturaNascimento-invalida');
  });

  test(
    'EditAnalyze with Partner Opening or Birthday Date invalid should throw dataAberturaNascimento-socios-invalida',
    () => {
      const tomorrow = DateTime.local().plus({ days: 1 }).toSQLDate();
      const data = getData();
      data.dadosCadastrais.socios[0].aberturaNascimento = tomorrow;
      const edited = editAnalyzeUseCase(data, arquivos, '00000000000000', 'alpe@alpe.com');
      return expect(edited).rejects.toThrowError('dataAberturaNascimento-socios-invalida');
    });
});
