import exportRelatorioDetalhadoUseCase from
  '../../../../../src/domain/usecases/financeiro/exportRelatorioDetalhadoUseCase';

describe('Domain :: UseCases :: Financeiro :: ExportRelatorio', () => {
  test('Export report', async (done) => {
    try {
      const data = {
        razaoSocial: 'KG Menswear LTDA.',
        nomeFantasia: 'KG Menswear - Fornecedor',
        documento: '32608796000156',
        id: 2,
        data: [
          {
            dataVenda: '2018-09-20T00:00:00.000Z',
            dataPagamento: '2018-10-20T00:00:00.000Z',
            statusTransacao: 'Aprovada',
            statusPagamento: 'Pago',
            operacao: 'Crédito a vista',
            valorVenda: 43,
            valorDesconto: 0.2,
            valorReceber: 0.3,
            idPos: '12345',
            idAutorizacao: '000000011111',
            nsu: 'AAAFOnAAAAAABpNAAE',
            nsuOriginal: 'AAAFOnAAAAAABpNAAF',
            cartao: '000111111XXXXXX1111'
          },
          {
            dataVenda: '2018-09-20T00:00:00.000Z',
            dataPagamento: '2018-10-20T00:00:00.000Z',
            statusTransacao: 'Aprovada',
            statusPagamento: 'Pago',
            operacao: 'Crédito a vista',
            valorVenda: 43,
            valorDesconto: 0.2,
            valorReceber: 0.3,
            idPos: '12345',
            idAutorizacao: '000000011111',
            nsu: 'AAAFOnAAAAAABpNAAE',
            nsuOriginal: 'AAAFOnAAAAAABpNAAF',
            cartao: '000111111XXXXXX1111'
          },
        ]
      };

      const excel = await exportRelatorioDetalhadoUseCase(data);
      expect(typeof excel === 'string').toBeTruthy();
    } catch (e) {
      expect(e).toBe(null);
    }
    done();
  });
});
