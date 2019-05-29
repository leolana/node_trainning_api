import cessaoTipo from '../../entities/cessaoTipo';
import cessaoStatus from '../../entities/cessaoStatus';
import validate from '../../services/cessao/validate';
import findById from '../../services/vinculo/findById';
import validateInstallment from '../../services/cessao/validateInstallment';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

const newInstallment = (db, siscofWrapper, mailer, emailTemplates, mailerConfig) => (
  vinculoId,
  diluicao,
  valorCessao,
  dataVencimento,
  dataExpiracao,
  referencia,
  numParcelasEscolhido,
  userId,
  userEmail,
  userName,
) => {
  const validaVinculo = (vinculo) => {
    if (!vinculo) throw new Exceptions.BondNotFoundException();

    const ehEstabelecimento = vinculo.participanteEstabelecimentoId !== userId;
    const ehFornecedor = vinculo.participanteFornecedorId !== userId;

    if (!ehEstabelecimento && !ehFornecedor) {
      throw new Exceptions.NotAuthorizedException();
    }

    return Promise.resolve(vinculo);
  };

  const validaCessao = (vinculo) => {
    validate(
      valorCessao,
      dataExpiracao,
      dataVencimento,
      vinculo,
    );
    return vinculo;
  };

  const validaParcelado = (vinculo) => {
    return validateInstallment(siscofWrapper)(
      valorCessao,
      dataVencimento,
      numParcelasEscolhido,
      vinculo.participanteFornecedorId,
      vinculo.participanteEstabelecimentoId,
    )
      .then(option => ({
        vinculo,
        option,
      }));
  };

  const salvarCessaoSiscof = (group) => {
    const cessao: any = {
      dataVencimento,
      dataExpiracao,
      referencia,
      participanteVinculo: group.vinculo,
      participanteVinculoId: vinculoId,
      usuario: userEmail,
      valorSolicitado: valorCessao,
      valorDisponivel: group.vinculo.valorDisponivel,
      solicitante: userName,
      tipo: cessaoTipo.parcelada,
      diluicaoPagamento: diluicao,
      numeroParcelas: group.option.month,
      valorParcelas: (() => {
        const round = 2;
        const parcela = +(valorCessao / group.option.month).toFixed(round);
        const parcelas = [...Array(group.option.month)].map(() => parcela);
        parcelas[0] += valorCessao - (parcela * group.option.month);
        return parcelas;
      })(),
    };

    return siscofWrapper
      .solicitarCessaoParcelada(cessao)
      .then((cessaoSiscof) => {
        cessao.codigoCessao = cessaoSiscof.codigoCessao;
        cessao.codigoRetornoSiscof = cessaoSiscof.codigoRetornoSiscof;
        cessao.mensagemRetornoSiscof = cessaoSiscof.mensagemRetornoSiscof;
        cessao.recebiveis = cessaoSiscof.recebiveis;
        cessao.status = cessaoStatus.aguardandoAprovacao;
        return cessao;
      })
      .catch((cessaoSiscof) => {
        cessao.codigoRetornoSiscof = cessaoSiscof.codigoRetornoSiscof;
        cessao.mensagemRetornoSiscof = cessaoSiscof.mensagemRetornoSiscof;
        cessao.status = cessaoStatus.falha;
        return cessao;
      });
  };

  const salvarCessao = (cessao) => {
    const action = (db.models as any).cessao
      .create(cessao)
      .then(c => Object.assign(c, cessao));

    return action;
  };

  const salvarHistorico = (cessao) => {
    const historico = Object.assign({}, cessao.dataValues);
    historico.cessaoId = historico.id;
    delete historico.id;

    return (db.models as any).cessaoHistorico.create(historico).then(() => {
      if (cessao.status === cessaoStatus.falha) {
        return Promise.reject(cessao.mensagemRetornoSiscof);
      }
      return cessao;
    });
  };

  const salvarRecebiveis = (cessao) => {
    if (cessao.status === cessaoStatus.falha) {
      return cessao;
    }

    cessao.recebiveis.forEach((recebivel) => {
      recebivel.cessaoId = cessao.id;
    });

    const create = Promise.all([
      (db.models as any).cessaoRecebivel.bulkCreate(cessao.recebiveis),
      (db.models as any).cessaoRecebivelHistorico.bulkCreate(cessao.recebiveis),
    ]);

    return create.then(() => cessao);
  };

  const enviarNotificacao = (cessao) => {
    const contatoInclude = () => ({
      model: (db.models as any).participanteContato,
      as: 'contatos',
      attributes: ['participanteId', 'email'],
      where: { ativo: true },
    });

    const participanteInclude = () => ({
      model: (db.models as any).participante,
      as: 'participante',
      attributes: ['id', 'nome'],
      include: [contatoInclude()],
      where: { ativo: true },
    });

    return Promise.all([
      (db.models as any).participanteFornecedor.findOne({
        where: {
          participanteId: cessao.participanteVinculo.participanteFornecedorId,
        },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
      (db.models as any).participanteEstabelecimento.findOne({
        where: {
          participanteId:
            cessao.participanteVinculo.participanteEstabelecimentoId,
        },
        attributes: ['participanteId'],
        include: [participanteInclude()],
      }),
    ])
      .then((results) => {
        const fornecedor = results[0];
        const estabelecimento = results[1];

        return Promise.all([
          mailer.enviar({
            templateName: emailTemplates.SOLICITAR_CESSAO_ESTABELECIMENTO,
            destinatary: estabelecimento.participante.contatos[0].email,
            substitutions: {
              codigoCessao: cessao.codigoCessao,
              fornecedor: fornecedor.participante.nome,
              linkCessaoAprovacao: (() => {
                const base = mailerConfig.baseUrl;
                return `${base}/cessao/detalhe/${cessao.id}`;
              })(),
            },
          }),
          mailer.enviar({
            templateName: emailTemplates.SOLICITAR_CESSAO_FORNECEDOR,
            destinatary: fornecedor.participante.contatos[0].email,
            substitutions: {
              codigoCessao: cessao.codigoCessao,
              estabelecimento: estabelecimento.participante.nome,
              linkCessaoReserva: (() => {
                const base = mailerConfig.baseUrl;
                return `${base}/cessao/detalhe/${cessao.id}`;
              })(),
            },
          }),
        ]);
      })
      .then(() => cessao.id);
  };

  return findById(db, siscofWrapper)(vinculoId)
    .then(validaVinculo)
    .then(validaCessao)
    .then(validaParcelado)
    .then(salvarCessaoSiscof)
    .then(salvarCessao)
    .then(salvarHistorico)
    .then(salvarRecebiveis)
    .then(enviarNotificacao)
    .then(id => ({ id }));
};

export default newInstallment;
