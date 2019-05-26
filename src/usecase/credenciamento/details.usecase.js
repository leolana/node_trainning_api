const { DateTime } = require('luxon');
// TODO: Definir uma forma de alterar o prazo das taxas base
const prazoTaxaBase = 33;

const tipoTaxa = require('../../service/participante/rateType.enum');

module.exports = db => (id) => {
  const bandeiraInclude = () => ({
    model: db.entities.bandeira,
    as: 'bandeira',
    attributes: ['id', ['nome', 'text']],
  });

  const cidadeInclude = () => ({
    model: db.entities.cidade,
    as: 'cidade',
    attributes: ['id', 'nome', 'estado'],
  });

  const ramoAtividadeInclude = () => ({
    model: db.entities.ramoAtividade,
    as: 'ramoAtividade',
    attributes: ['codigo', 'descricao'],
  });

  const find = () => db.entities.credenciamento.findOne({
    where: { id },
    attributes: ['id', 'tipoPessoa', 'documento', 'telefone',
      'aberturaNascimento', 'nome', 'nomeMae', 'cep', 'logradouro', 'numero',
      'complemento', 'bairro', 'razaoSocial', 'inscricaoEstadual',
      'inscricaoMunicipal', 'ecommerce', 'arquivos', 'status', 'participanteId',
      'createdAt', 'usuario',
    ],
    include: [
      cidadeInclude(),
      ramoAtividadeInclude(),
      {
        model: db.entities.faturamentoCartao,
        as: 'faturamentoCartao',
        attributes: ['id', 'descricao'],
      },
      {
        model: db.entities.ticketMedio,
        as: 'ticketMedio',
        attributes: ['id', 'descricao'],
      },
      {
        model: db.entities.credenciamentoInstalacao,
        as: 'instalacao',
        attributes: ['cep', 'logradouro', 'numero', 'complemento', 'bairro',
          'pontoReferencia', 'dias', 'horario', 'nome', 'email',
          'telefone', 'celular'],
        include: [cidadeInclude()],
      },
      {
        model: db.entities.credenciamentoContato,
        as: 'contato',
        attributes: ['nome', 'email', 'telefone', 'celular'],
      },
      {
        model: db.entities.credenciamentoDomicilioBancario,
        as: 'domiciliosBancarios',
        attributes: ['bancoId', 'bancoNome', 'agencia', 'conta', 'digito'],
        include: [bandeiraInclude()],
      },
      {
        model: db.entities.credenciamentoSocio,
        as: 'socios',
      },
      {
        model: db.entities.credenciamentoCaptura,
        as: 'capturas',
        attributes: ['id', 'quantidade'],
        include: [{
          model: db.entities.captura,
          as: 'captura',
          attributes: ['id', 'tipoCaptura', 'valor'],
          include: [{
            model: db.entities.produto,
            as: 'produto',
            attributes: ['id', 'nome'],
          }],
        }],
      },
      {
        model: db.entities.taxaContratual,
        as: 'taxaContratual',
        attributes: ['id', 'antecipacao', 'adesao', 'maximoParcelas'],
      },
      {
        model: db.entities.credenciamentoTaxaAdministrativa,
        as: 'taxasAdministrativas',
        attributes: ['id', 'valor'],
        include: [{
          model: db.entities.taxaAdministrativa,
          as: 'taxaAdministrativa',
          attributes: ['id'],
          include: [
            bandeiraInclude(),
            {
              model: db.entities.taxaPrazo,
              as: 'taxaPrazo',
              attributes: ['id', 'coeficiente', 'prazo', 'minimo', 'maximo'],
            },
          ],
        }],
      },
      {
        model: db.entities.credenciamentoTaxaDebito,
        as: 'taxasDebito',
        attributes: ['id', 'valor'],
        include: [{
          model: db.entities.taxaBandeira,
          as: 'taxaBandeira',
          attributes: ['id'],
          include: [bandeiraInclude()],
        }],
      },
      {
        model: db.entities.credenciamentoAprovacao,
        as: 'historicoAprovacao',
        attributes: ['status', 'usuario', 'observacao', 'createdAt'],
        order: ['createdAt', 'desc'],
      },
      {
        model: db.entities.participante,
        as: 'participante',
        attributes: ['id'],
        required: false,
        include: [{
          model: db.entities.participanteTaxa,
          as: 'taxas',
          attributes: ['id', 'taxa', 'participanteTaxaTipo'],
        }],
      }],
  });

  const map = (credenciamento) => {
    const extratosBancarios = credenciamento.arquivos.extratosBancarios.map(
      t => ({
        tipo: 'extratosBancarios',
        arquivo: t,
      })
    );

    const analises = credenciamento.arquivos.analises.map(t => ({
      id: t.id,
      tipo: 'analise',
      arquivo: t.arquivo,
      observacao: t.observacao,
    }));

    const arquivos = extratosBancarios.concat(analises);

    if (credenciamento.arquivos.identidade) {
      arquivos.push({
        tipo: 'identidade',
        arquivo: credenciamento.arquivos.identidade,
      });
    }

    if (credenciamento.arquivos.fichaCadastro) {
      arquivos.push({
        tipo: 'fichaCadastro',
        arquivo: credenciamento.arquivos.fichaCadastro,
      });
    }

    if (credenciamento.arquivos.comprovanteDeResidencia) {
      arquivos.push({
        tipo: 'comprovanteDeResidencia',
        arquivo: credenciamento.arquivos.comprovanteDeResidencia,
      });
    }

    if (credenciamento.arquivos.contratoSocial) {
      arquivos.push({
        tipo: 'contratoSocial',
        arquivo: credenciamento.arquivos.contratoSocial,
      });
    }

    const ultimaAlteracaoStatus = credenciamento.historicoAprovacao[0];

    const contratual = credenciamento.taxaContratual.dataValues;
    const antecipacao = ((credenciamento.participante || {}).taxas || []).find(
      t => t.participanteTaxaTipo === tipoTaxa.antecipacao
    ) || {};

    const result = {
      id: credenciamento.id,
      credenciamento: {
        fonte: 'Back Office',
        dataEnvio:
          DateTime.fromJSDate(credenciamento.createdAt).toISO(),
        nomeEnvio: credenciamento.usuario,
        ip: '',
        status: credenciamento.status,
        dataStatus:
          DateTime.fromJSDate(ultimaAlteracaoStatus.createdAt).toISO(),
        alteradoPor: ultimaAlteracaoStatus.usuario,
      },
      cadastro: {
        nome: credenciamento.nome,
        tipoPessoa: credenciamento.tipoPessoa,
        documento: credenciamento.documento,
        aberturaNascimento:
          DateTime.fromISO(credenciamento.aberturaNascimento).toISODate(),
        telefone: credenciamento.telefone,
        nomeMae: credenciamento.nomeMae,
        razaoSocial: credenciamento.razaoSocial,
        inscricaoEstadual: credenciamento.inscricaoEstadual,
        inscricaoMunicipal: credenciamento.inscricaoMunicipal,
        ramoAtividade: credenciamento.ramoAtividade.descricao,
        cep: credenciamento.cep,
        logradouro: credenciamento.logradouro,
        numero: credenciamento.numero,
        complemento: credenciamento.complemento,
        bairro: credenciamento.bairro,
        cidade: credenciamento.cidade.nome,
        estado: credenciamento.cidade.estado,
        informacoesFinanceiras: {
          faturamentoAnual: {
            id: credenciamento.faturamentoCartao.id,
            text: credenciamento.faturamentoCartao.descricao,
          },
          ticketMedio: {
            id: credenciamento.ticketMedio.id,
            text: credenciamento.ticketMedio.descricao,
          },
        },
        participanteId: credenciamento.participanteId,
        cidadeDetalhe: credenciamento.cidade,
        ramoAtividadeDetalhe: credenciamento.ramoAtividade,
      },
      contato: {
        ...credenciamento.contato.dataValues,
      },
      instalacao: {
        ...credenciamento.instalacao.dataValues,
      },
      domiciliosBancarios: credenciamento.domiciliosBancarios.map(
        d => ({ banco: `${d.bancoId} - ${d.bancoNome}`, ...d.dataValues })
      ),
      captura: {
        url: credenciamento.ecommerce,
        capturas: credenciamento.capturas,
      },
      arquivos,
      condicoesComerciais: {
        taxaContratual: {
          id: contratual.id,
          antecipacaoOriginal: contratual.antecipacao,
          antecipacao: antecipacao.taxa || contratual.antecipacao,
          adesao: contratual.adesao,
          maximoParcelas: contratual.maximoParcelas,
          idTaxaParticipante: antecipacao.id,
        },
        taxasDebito: credenciamento.taxasDebito.map(t => ({
          id: t.taxaBandeira.id,
          idTaxaCredenciamento: t.id,
          valor: t.valor,
          bandeira: t.taxaBandeira.bandeira,
        })),
        taxasAdministrativas: credenciamento.taxasAdministrativas.map(t => ({
          id: t.taxaAdministrativa.id,
          idTaxaCredenciamento: t.id,
          valor: t.valor,
          bandeira: t.taxaAdministrativa.bandeira,
          prazo: t.taxaAdministrativa.taxaPrazo.prazo,
          coeficiente: t.taxaAdministrativa.taxaPrazo.coeficiente,
          opcoesParcelamento: {
            minimoParcelas: t.taxaAdministrativa.taxaPrazo.minimo,
            maximoParcelas: t.taxaAdministrativa.taxaPrazo.maximo,
          },
        })),
        prazoTaxaBase,
      },
      socios: credenciamento.socios,
    };
    return result;
  };

  return find()
    .then(map);
};
