// tslint:disable:no-magic-numbers
import { injectable, inject } from 'inversify';

import SiscofConnector from './SiscofConnector';
import SiscofFormatter from './SiscofFormatter';
import tiposPessoa from '../../domain/entities/tiposPessoa';
import participanteVinculoStatus from '../../domain/entities/participanteVinculoStatus';

import types from '../../constants/types';
import { PreconditionFailedError } from '../../interfaces/rest/errors/ApiErrors';
import rateTypeEnum from '../../domain/services/types/rateTypeEnum';

@injectable()
class SiscofWrapper {
  private siscofConnector: SiscofConnector;
  private siscofFormatter: SiscofFormatter;
  constructor(
    @inject(types.SiscofConnectorFactory) siscofConnector: () => SiscofConnector,
    @inject(types.SiscofFormatter) siscofFormatter: SiscofFormatter
  ) {
    this.siscofConnector = siscofConnector();
    this.siscofFormatter = siscofFormatter;
  }

  private eventos = [32, 33, 34];

  private diasSemana = (value) => {
    const diasSelecionados = [];
    const segunda = 1;
    const terca = 2;
    const quarta = 4;
    const quinta = 8;
    const sexta = 16;
    const sabado = 32;
    const domingo = 64;

    if (value & segunda) diasSelecionados.push('seg');
    if (value & terca) diasSelecionados.push('ter');
    if (value & quarta) diasSelecionados.push('qua');
    if (value & quinta) diasSelecionados.push('qui');
    if (value & sexta) diasSelecionados.push('sex');
    if (value & sabado) diasSelecionados.push('sab');
    if (value & domingo) diasSelecionados.push('dom');

    return diasSelecionados.join(',');
  }

  private convertDecimalToString = (number: any) => {
    if (((number || null) == null) || isNaN(number)) return null;

    // Devido a problema de localização no oracle,
    // vamos mandar os decimais sem o ponto,
    // e será dividido por 100 no siscof
    const value: number = +(number * 100).toFixed(2);
    return Math.trunc(value);
  }

  private obterCidadeEstado = (participante, isEstabelecimento) => {
    let cidade = null;
    let estado = null;
    if (isEstabelecimento) {
      cidade = participante.credenciamento != null
        && (participante.credenciamento.cidade || null) != null
        ? participante.credenciamento.cidade.nome
        : null;

      estado = participante.credenciamento != null
        && (participante.credenciamento.cidade || null) != null
        ? participante.credenciamento.cidade.estado
        : null;

    } else {
      cidade = participante.cidade;
      estado = participante.estado;
    }

    return {
      cidade,
      estado,
    };
  }

  private horarios = (idHorario) => {
    const horarios = {
      1: 'Horário comercial',
      2: '24 horas',
      3: 'Manhã',
      4: 'Tarde',
      5: 'Noite',
    };

    return horarios[idHorario];
  }

  // 1 - Cadastro de EC / Fornecedor
  incluirParticipante = (participante, isEstabelecimento) => {
    const credenciamento = (participante.credenciamento || null) != null
      ? participante.credenciamento
      : null;

    const dadosCidade = this.obterCidadeEstado(participante, isEstabelecimento);

    const cidade = dadosCidade.cidade;
    const estado = dadosCidade.estado;

    const objParticipante = {
      ipf_pj: tiposPessoa.sigla(participante.tipoPessoa),
      Loja: participante.id,
      CPF_CNPJ: participante.documento,
      RazaoSocial: participante.razaoSocial,
      NomeFantasia: participante.nome,
      NomeMae: participante.nomeMae,
      InscricaoEstadual: participante.inscricaoEstadual,
      InscricaoMunicipal: participante.inscricaoMunicipal,
      CEP: participante.cep,
      Endereco: participante.logradouro,
      Numero: participante.numero,
      Bairro: participante.bairro,
      Cidade: cidade,
      Estado: estado,
      DataAbertura: participante.aberturaNascimento,
      Complemento: participante.complemento,
      Telefone1: participante.telefone,
      Telefone2: participante.contatos[0].telefone,
      Responsavel: participante.contatos[0].nome,
      Celular: participante.contatos[0].celular,
      Email: participante.contatos[0].email,
      DataCadastro: participante.createdAt,
      DataAtualizacao: participante.updatedAt,
      MCC: participante.ramoAtividadeCodigo,
      Cessionario: isEstabelecimento ? 'N' : 'S',
      isAlteracao: participante.isAlteracao,
    };

    if (credenciamento != null) {
      const objCredenciamento = {
        IdentificadorEcommerce: credenciamento.ecommerce != null ? 'S' : 'N',
        URL_E_Commerce: credenciamento.ecommerce,
      };

      Object.assign(objParticipante, objCredenciamento);
    }

    const instalacao = credenciamento != null
      && (credenciamento.instalacao || null) != null
      ? credenciamento.instalacao : null;

    if (instalacao != null) {
      const objInstalacao = {
        CepCorrespondencia: instalacao.cep,
        EndCorrespondencia: instalacao.logradouro,
        NumEndCorrespondencia: instalacao.numero,
        BairroCorrespondencia: instalacao.bairro,
        CidadeCorrespondencia: (instalacao.cidade || null) != null ? instalacao.cidade.nome : null,
        EstadoCorrespondencia: (instalacao.cidade || null) != null ? instalacao.cidade.estado : null,
        ComplementoCorrespondencia: instalacao.complemento,
        HorarioFuncionamento: `${this.diasSemana(instalacao.dias)},${this.horarios(instalacao.horario)}`,
        PontoReferencia: instalacao.pontoReferencia,
      };

      Object.assign(objParticipante, objInstalacao);
    }

    const responsavel = [];
    const socioLength = (participante.socios || null) != null
      && participante.socios.length <= 3
      ? participante.socios.length
      : 0;

    // tslint:disable-next-line:no-increment-decrement
    for (let i = 0; i < 3; i++) {
      if (socioLength == 0 || socioLength < i + 1) {
        responsavel.push({});
        continue;
      }

      responsavel.push(participante.socios[i]);
    }

    const objResponsavel = {
      Responsavel1: responsavel[0].nome,
      CPF1: responsavel[0].documento,
      DataNascimento1: responsavel[0].aberturaNascimento,
      Participacao1: responsavel[0].participacao,
      Email1: responsavel[0].email,
      Rg1: responsavel[0].rg,
      Celular1: responsavel[0].celular,
      NomeMae1: responsavel[0].nomeMae,
      Responsavel2: responsavel[1].nome,
      CPF2: responsavel[1].documento,
      DataNascimento2: responsavel[1].aberturaNascimento,
      Participacao2: responsavel[1].participacao,
      Email2: responsavel[1].email,
      Rg2: responsavel[1].rg,
      Celular2: responsavel[1].celular,
      NomeMae2: responsavel[1].nomeMae,
      Responsavel3: responsavel[2].nome,
      CPF3: responsavel[2].documento,
      DataNascimento3: responsavel[2].aberturaNascimento,
      Participacao3: responsavel[2].participacao,
      Email3: responsavel[2].email,
      Rg3: responsavel[2].rg,
      Celular3: responsavel[2].celular,
      NomeMae3: responsavel[2].nomeMae,
    };

    Object.assign(objParticipante, objResponsavel);

    const refBanco = [];
    const domiciliosBancarios = participante.domiciliosBancarios != null
      ? participante.domiciliosBancarios
      : null;

    if (domiciliosBancarios != null) {
      domiciliosBancarios.forEach((conta) => {
        refBanco.push({
          Bandeira: this.siscofFormatter.getBandeiraSiscof(conta.bandeiraId),
          Banco: conta.bancoId,
          Agencia: conta.agencia,
          AgenciaDv: conta.agenciaDigito,
          TipoConta: 'CC',
          Conta: conta.conta,
          ContaDv: conta.digito,
        });
      });
    }

    const objDomiciliosBancarios = {
      Ref_Banco: refBanco,
    };

    Object.assign(objParticipante, objDomiciliosBancarios);

    const equipamentos = [];
    const capturas = credenciamento != null
      && (credenciamento.capturas || null) != null
      ? credenciamento.capturas : null;

    if (capturas != null) {
      capturas.forEach((captura) => {
        equipamentos.push({
          Marca: '',
          Produto: captura.captura.produto.nome,
          TipoCaptura: captura.captura.tipoCaptura == 1 ? 'Aluguel' : 'Venda',
          Quantidade: captura.quantidade,
          Valor: this.convertDecimalToString(captura.valor),
        });
      });
    }

    const objEquipamentos = {
      Equipamentos: equipamentos,
    };

    Object.assign(objParticipante, objEquipamentos);

    const taxas = [];
    let taxasCessao = [];

    const taxaContratual = participante.taxaContratual != null
      ? participante.taxaContratual : null;

    const taxasAdministrativas = credenciamento != null
      && (credenciamento.taxasAdministrativas || null) != null
      ? credenciamento.taxasAdministrativas : null;

    const taxasDebito = credenciamento != null
      && (credenciamento.taxasDebito || null) != null
      ? credenciamento.taxasDebito : null;

    if ((taxasAdministrativas || []).length > 0) {
      taxasAdministrativas.forEach((taxa) => {
        const tAdm = taxa.taxaAdministrativa;

        taxas.push({
          Adquirente: 5,
          Bandeira: this.siscofFormatter.getBandeiraSiscof(tAdm.bandeiraId),
          CodEvento: tAdm.taxaPrazo.eventoId,
          Tx_adm: this.convertDecimalToString(taxa.valor),
          Tx_antecipacao: this.convertDecimalToString(taxaContratual.antecipacao),
          DiasAntecipacao: tAdm.taxaPrazo.prazo,
        });
      });
    }

    if (!isEstabelecimento) {
      const taxasFornecedor = participante.everyTax || participante.taxas;
      const taxaAntecipacao = taxasFornecedor
        .filter(t => t.participanteTaxaTipo === rateTypeEnum.antecipacao)[0];
      const participantetaxasCessao = taxasFornecedor
        .filter(t => t.participanteTaxaTipo === rateTypeEnum.cessao);

      this.siscofFormatter.siscofBandeiras.forEach((b) => {
        this.eventos.forEach((e) => {
          taxas.push({
            Adquirente: 5,
            Bandeira: b,
            CodEvento: e,
            Tx_adm: null,
            Tx_antecipacao: this.convertDecimalToString(taxaAntecipacao.taxa),
            DiasAntecipacao: 0,
          });
        });
      });

      taxas.push({
        Adquirente: 5,
        Bandeira: 99,
        CodEvento: 133,
        Tx_adm: null,
        Tx_antecipacao: this.convertDecimalToString(taxaAntecipacao.taxa),
        DiasAntecipacao: 0,
      });

      taxasCessao = (participantetaxasCessao || []).map(t => ({
        ValorIni: this.convertDecimalToString(t.valorInicio),
        ValorFim: this.convertDecimalToString(t.valorFim),
        ValorTaxa: this.convertDecimalToString(t.taxa),
      }));
    }

    if ((taxasDebito || []).length > 0) {
      taxasDebito.forEach((taxa) => {
        const tDeb = taxa.taxaBandeira;

        taxas.push({
          Adquirente: 5,
          Bandeira: this.siscofFormatter.getBandeiraSiscof(tDeb.bandeiraId),
          CodEvento: 1, // Evento "Débito"
          Tx_adm: this.convertDecimalToString(taxa.valor),
          Tx_antecipacao: this.convertDecimalToString(taxaContratual.antecipacao),
          DiasAntecipacao: 0,
        });
      });
    }

    const objTaxas = {
      Taxas: taxas,
      TaxasCessao: taxasCessao,
    };

    Object.assign(objParticipante, objTaxas);

    return this.siscofConnector.incluirEstabelecimento(objParticipante)
      .then((result) => {
        if (result.nrtc != 0) throw new PreconditionFailedError(result.wrtc);
      });
  }

  // 2 - Cadastro Cessionário X EC
  incluirExcluirCessionarioEC = (cessionario, ec, status) => {
    if (status === participanteVinculoStatus.aprovado) {
      return this.siscofConnector.incluirCessionarioEC(cessionario, ec)
        .then((result) => {
          if (result.wrtc != 0) throw new PreconditionFailedError(result.wmsg);
        });
    }
    if (status === participanteVinculoStatus.cancelado) {
      return this.siscofConnector.excluirCessionarioEC(cessionario, ec)
        .then((result) => {
          if (result.wrtc != 0) throw new PreconditionFailedError(result.wmsg);
        });
    }

    return Promise.resolve();
  }
  // 2.1 - Taxa Cessionário
  consultarTarifaCessionario = fornecedorId => this.siscofConnector.consultarTarifaCessionario(fornecedorId)
    .then((result) => {
      if (result.nrtc != 0) throw new PreconditionFailedError(result.wrtc);

      return {
        taxas: result.taxas,
        taxaAntecipacao: result.taxaAntecipacao,
      };
    })

  // 3 - Solicitar Cessão (Fornecedor)
  solicitarCessao = (cessao) => {
    const objCessao = {
      cessionario: cessao.participanteVinculo.participanteFornecedorId,
      estabelecimento: cessao.participanteVinculo.participanteEstabelecimentoId,
      dtReservaCessao: cessao.dataVencimento,
      valorReserva: cessao.valorSolicitado,
      diluicaoPagamento: cessao.diluicaoPagamento,
    };

    return this.siscofConnector.solicitarCessao(objCessao)
      .then((result) => {
        if (result.nrtc < 0) {
          throw new PreconditionFailedError(JSON.stringify({
            codigoCessao: result.nrtc,
            codigoRetornoSiscof: result.nrtc,
            mensagemRetornoSiscof: result.wrtc,
          }));
        }

        return {
          codigoCessao: result.nrtc,
          codigoRetornoSiscof: result.nrtc,
          mensagemRetornoSiscof: result.wrtc,
          recebiveis: result.recebiveis,
        };
      });
  }

  solicitarCessaoParcelada = (cessao) => {
    const objCessao = {
      cessionario: cessao.participanteVinculo.participanteFornecedorId,
      estabelecimento: cessao.participanteVinculo.participanteEstabelecimentoId,
      dtReservaCessao: cessao.dataVencimento,
      valorReserva: cessao.valorSolicitado,
      diluicaoPagamento: cessao.diluicaoPagamento,
      numeroParcelas: cessao.numeroParcelas,
      valorParcelas: cessao.valorParcelas,
    };

    return this.siscofConnector.solicitarCessaoParcelada(objCessao)
      .then((result) => {
        if (result.nrtc < 0) {
          throw new PreconditionFailedError(JSON.stringify({
            codigoCessao: result.nrtc,
            codigoRetornoSiscof: result.nrtc,
            mensagemRetornoSiscof: result.wrtc,
          }));
        }

        return {
          codigoCessao: result.nrtc,
          codigoRetornoSiscof: result.nrtc,
          mensagemRetornoSiscof: result.wrtc,
          recebiveis: result.recebiveis,
        };
      });
  }

  // 4 - Cancelamento Cessão (Reserva)
  // 5 - Efetivar Cessão (EC)
  aprovarRecusarCessao = (cessaoId, notaFiscal, isAprovar) => {
    if (isAprovar) {
      return this.siscofConnector.efetivarCessao(cessaoId, notaFiscal)
        .then((result) => {
          if (result.wrtc != 0) throw new PreconditionFailedError(result.wmsg);
        });
    }

    return this.siscofConnector.excluirCessao(cessaoId)
      .then((result) => {
        if (result.nrtc != 0) throw new PreconditionFailedError(result.wrtc);
      });
  }

  // 7.3 -	Listar Cessões
  listarCessoes = objCessao => this.siscofConnector.listarCessoes(objCessao)
    .then((result) => {
      if (result.wrtc != 0) throw new PreconditionFailedError(result.wmsg);

      return {
        cessoes: result.cessoes,
      };
    })

  // 7.3 -	Detalhe Cessão
  listarCessoesDetalhe = (cessao, vinculo) => {
    const params = {
      estabelecimento: vinculo.participanteEstabelecimentoId,
      fornecedor: vinculo.participanteFornecedorId,
      dataIni: null,
      dataFim: null,
      status_cessao: null,
      cessao: cessao.codigoCessao,
      id: cessao.id,
    };

    return this.siscofConnector.listarCessoesDetalhe(params)
      .then((result) => {
        if (result.wrtc < 0) throw new PreconditionFailedError(result.wmsg);

        return {
          recebiveis: result.recebiveis,
        };
      });
  }
  // 8 - Solicitação de Antecipação
  listarMovimentosParaAntecipar = objFiltro => this.siscofConnector.listarMovimentosParaAntecipar(objFiltro)
    .then((result) => {
      if (result.wrtc < 0) throw new PreconditionFailedError(result.wmsg);

      return {
        movimentos: result.movimentos,
      };
    })

  consultarAntecipacaoRealizada = objFiltro => this.siscofConnector.consultarAntecipacaoRealizada(objFiltro)
    .then((result) => {
      if (result.wrtc < 0) throw new PreconditionFailedError(result.wmsg);

      return {
        movimentos: result.movimentos,
      };
    })

  efetivarAntecipacao = objAntecipacoes => this.siscofConnector.efetivarAntecipacao(objAntecipacoes)
    .then((result) => {
      if (result.wrtc < 0) throw new PreconditionFailedError(result.wmsg);

      return result;
    })
  // 9 - Consulta Valor disponível de Cessão (Limite)
  consultarValorDisponivelCessao = (fornecedorId, estabelecimentoId) => {
    const params = {
      cessionario: fornecedorId,
      estabelecimento: estabelecimentoId,
    };

    return this.siscofConnector.consultarValorDisponivelCessao(params)
      .then((result) => {
        if (result.nrtc == null) {
          return 0;
        }

        if (result.nrtc != 0) throw new PreconditionFailedError(result.wrtc);

        return Math.max(result.nValor, 0);
      })
      .catch(() => 0);
  }
  consultarValorDisponivelCessaoParcelada = (fornecedorId, estabelecimentoId, dataVencimento) => {
    const params = {
      dataVencimento,
      cessionario: fornecedorId,
      estabelecimento: estabelecimentoId,
    };

    return this.siscofConnector.consultarValorDisponivelCessaoParcelada(params)
      .then((result) => {
        if (result.nrtc == null) {
          return [];
        }

        if (result.nrtc != 0) throw new PreconditionFailedError(result.wrtc);

        return result.disponiveis;
      });
  }
  // Relatórios
  extratoDetalhado = params => this.siscofConnector.extratoDetalhado(params)
    .then((result) => {
      if (result.nrtc < 0) throw new PreconditionFailedError(result.wrtc);

      return {
        movimentos: result.movimentos,
      };
    })

  extratoResumido = participanteId => this.siscofConnector.extratoResumido(participanteId)
    .then((result) => {
      if (result.nrtc < 0) throw new PreconditionFailedError(result.wrtc);

      return {
        consolidados: result.consolidados,
      };
    })

  getAntecipacoesConsolidado = params => this.siscofConnector.getAntecipacoesConsolidado(params)
    .then((result) => {
      if (result.nrtc < 0) throw new PreconditionFailedError(result.wrtc);

      return {
        antecipacoes: result.antecipacoes,
      };
    })

  getCessoesRealizadas = params => this.siscofConnector.getCessoesRealizadas(params)
    .then((result) => {
      if (result.nrtc < 0) throw new PreconditionFailedError(result.wrtc);

      return {
        cessoes: result.cessoes,
      };
    })

  // Relatórios CSV
  exportarRemessaVendas = (
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal
  ) => this.siscofConnector
    .obterRelatorioRemessaVendas(
      participanteId,
      dataOperacaoInicial,
      dataOperacaoFinal
    )
    .then(result => result.csv)

  exportarRegistroVendasDetalhe = (
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal
  ) => this.siscofConnector
    .obterRelatorioRegistroVendasDetalhe(
      participanteId,
      dataOperacaoInicial,
      dataOperacaoFinal
    )
    .then(result => result.csv)

  exportarRegistroVendasResumo = (
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal
  ) => this.siscofConnector
    .obterRelatorioRegistroVendasResumo(
      participanteId,
      dataOperacaoInicial,
      dataOperacaoFinal
    )
    .then(result => result.csv)

  exportarPagamentos = (
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal
  ) => this.siscofConnector
    .obterRelatorioPagamentos(
      participanteId,
      dataOperacaoInicial,
      dataOperacaoFinal
    )
    .then(result => result.csv)

  exportarAjustesTarifas = (
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal
  ) => this.siscofConnector
    .obterRelatorioAjustesTarifas(
      participanteId,
      dataOperacaoInicial,
      dataOperacaoFinal
    )
    .then(result => result.csv)

  exportarFinanceiro = (
    participanteId,
    dataOperacaoInicial,
    dataOperacaoFinal
  ) => this.siscofConnector
    .obterRelatorioFinanceiro(
      participanteId,
      dataOperacaoInicial,
      dataOperacaoFinal
    )
    .then(result => result.csv)
}

export default SiscofWrapper;
