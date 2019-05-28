interface SiscofConnector {
  executeCommand;
  incluirEstabelecimento;
  incluirCessionarioEC;
  excluirCessionarioEC;
  consultarTarifaCessionario;
  solicitarCessao;
  solicitarCessaoParcelada;
  excluirCessao;
  efetivarCessao;
  listarCessoes;
  listarCessoesDetalhe;
  listarMovimentosParaAntecipar;
  consultarAntecipacaoRealizada;
  getAntecipacoesConsolidado;
  getCessoesRealizadas;
  efetivarAntecipacao;
  consultarValorDisponivelCessao;
  consultarValorDisponivelCessaoParcelada;
  extratoResumido;
  extratoDetalhado;
  obterRelatorioRemessaVendas;
  obterRelatorioRegistroVendasDetalhe;
  obterRelatorioRegistroVendasResumo;
  obterRelatorioPagamentos;
  obterRelatorioAjustesTarifas;
  obterRelatorioFinanceiro;
}

export default SiscofConnector;
