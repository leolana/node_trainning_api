// tslint:disable no-magic-numbers
import { DateTime } from 'luxon';

const exportRelatorioDetalhadoUseCase = async (dataRelatorio: any) => {

  const formatDate = (date: string) => {
    const formatted = DateTime.fromISO(date).toFormat('dd/MM/yyyy');
    return formatted === 'Invalid DateTime' ? '' : formatted;
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2)}`;
  };

  const map = (relatorio: any) => {
    const array = [];
    array.push(['Código: ', relatorio.id], ['Nome:', relatorio.nomeFantasia], ['Documento:', relatorio.documento], []);
    array.push(['Data Venda', 'Data Pagamento', 'Status Pagamento', 'Bandeira', 'Modalidade', 'Valor Parcela',
      'Valor Desconto', 'Valor a Receber', 'Terminal', 'Autorização', 'NSU', 'NSU Original', 'Cartão']);
    relatorio.data.forEach((item) => {
      array.push([
        formatDate(item.dataVenda),
        formatDate(item.dataPagamento),
        item.statusPagamento,
        item.bandeira,
        item.operacao,
        formatCurrency(item.valorVenda),
        formatCurrency(item.valorDesconto),
        formatCurrency(item.valorReceber),
        item.idPos,
        item.idAutorizacao,
        item.nsu,
        item.nsuOriginal,
        item.cartao,
      ]);
    });
    return array;
  };

  const generate = dataMap => dataMap.reduce(
    (acc, curr) => {
      acc.push(curr.join(';'));
      return acc;
    },
    []
  ).join('\n');

  const excel = map(dataRelatorio);

  return generate(excel);

};

export default exportRelatorioDetalhadoUseCase;
