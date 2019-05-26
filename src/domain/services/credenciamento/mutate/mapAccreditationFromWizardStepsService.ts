import { DateTime } from 'luxon';
import credenciamentoStatusEnum from '../../../entities/credenciamentoStatusEnum';
import personTypeEnum from '../../participante/personTypeEnum';
import deformatDocument from '../deformatDocument';

/**
 * Mapeia os dados de cada step do wizard para o objeto da model de credenciamento
 *
 * @param dadosCredenciamento objeto com dados de cada step do wizard vindo do front
 * @param statusCredenciamento status do credenciamento que está sendo incluído/editado
 * @param documento CPF ou CNPJ
 * @param userEmail email do usuário que está criando/editando o credenciamento
 */
const mapAccreditationFromWizardStepsService = async (
  dadosCredenciamento: any,
  statusCredenciamento: credenciamentoStatusEnum,
  documento: string,
  userEmail: string
) => {

  const domicilios: any[] = dadosCredenciamento.dadosCadastrais.domiciliosBancarios.map((item: any) => ({
    bandeiraId: +item.bandeira.id,
    bancoId: item.banco.id,
    bancoNome: item.banco.text,
    agencia: item.agencia,
    conta: item.conta,
    digito: item.digito,
    arquivo: item.arquivo || null,
    existing: item.existing,
    newFile: item.newFile
  }));

  domicilios.sort((a, b) => a.bandeiraId - b.bandeiraId);

  const credenciamento: any = {
    documento: deformatDocument(documento),
    status: statusCredenciamento,
    nome: dadosCredenciamento.dadosCadastrais.nome,
    tipoPessoa: +dadosCredenciamento.tipoPessoa,
    ramoAtividadeCodigo: +dadosCredenciamento.dadosCadastrais.ramoAtividade,
    aberturaNascimento:
      DateTime.fromISO(dadosCredenciamento.dadosCadastrais.aberturaNascimento).toISODate(),
    telefone: dadosCredenciamento.dadosCadastrais.telefone,
    cep: dadosCredenciamento.dadosCadastrais.cep,
    logradouro: dadosCredenciamento.dadosCadastrais.logradouro,
    complemento: dadosCredenciamento.dadosCadastrais.complemento,
    numero: dadosCredenciamento.dadosCadastrais.numero,
    bairro: dadosCredenciamento.dadosCadastrais.bairro,
    cidadeId: +dadosCredenciamento.dadosCadastrais.cidade,
    taxaAdesao: dadosCredenciamento.condicaoComercial.taxaAdesao,
    faturamentoCartaoId:
      +dadosCredenciamento.dadosCadastrais.informacoesFinanceiras.faturamentoAnual.id,
    ticketMedioId:
      +dadosCredenciamento.dadosCadastrais.informacoesFinanceiras.ticketMedio.id,
    ecommerce: dadosCredenciamento.captura.url,
    usuario: userEmail,
    domiciliosBancarios: domicilios,
    capturas: dadosCredenciamento.captura.capturas.map(t => ({
      capturaId: +t.id,
      quantidade: +t.quantidade,
      valor: t.valor
    })),
    instalacao: { cidadeId: dadosCredenciamento.instalacao.cidade, ...dadosCredenciamento.instalacao },
    contato: {
      nome: dadosCredenciamento.dadosCadastrais.contato.nomeContato,
      email: dadosCredenciamento.dadosCadastrais.contato.emailContato,
      telefone: dadosCredenciamento.dadosCadastrais.contato.telefoneContato,
      celular: dadosCredenciamento.dadosCadastrais.contato.celularContato,
    },
    taxaContratualId: +dadosCredenciamento.condicaoComercial.taxaContratual,
    taxasAdministrativas:
      dadosCredenciamento.condicaoComercial.taxasAdministrativas.map(t => ({
        taxaAdministrativaId: t.id,
        valor: t.valor,
      })),
    taxasDebito:
      dadosCredenciamento.condicaoComercial.taxasDebito.map(t => ({
        taxaBandeiraId: t.id,
        valor: t.valor,
      })),
    socios: (dadosCredenciamento.dadosCadastrais.socios || []).map((socio) => {
      delete socio.id;
      return socio;
    }),
    historicoAprovacao: [{
      status: credenciamentoStatusEnum.pendente,
      usuario: userEmail,
      observacao: '',
    }],
    arquivos: {
      analises: [],
    }
  };

  credenciamento.socios.forEach(s => delete s.id);

  if (dadosCredenciamento.credenciamento) {
    credenciamento.createdAt = dadosCredenciamento.credenciamento.createdAt;
  }

  if (+credenciamento.tipoPessoa === personTypeEnum.juridica) {
    credenciamento.razaoSocial = dadosCredenciamento.dadosCadastrais.razaoSocial;
    credenciamento.inscricaoEstadual = dadosCredenciamento.dadosCadastrais.inscricaoEstadual;
    credenciamento.inscricaoMunicipal = dadosCredenciamento.dadosCadastrais.inscricaoMunicipal;
  }

  return credenciamento;
};

export default mapAccreditationFromWizardStepsService;
