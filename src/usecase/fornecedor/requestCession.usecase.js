const cessaoTipo = require('../../service/cessao/type.enum');
const cessaoStatus = require('../../service/cessao/status.enum');
const emailTemplates = require('../../service/mailer/emailTemplates.enum');
const termoTipo = require('../../service/termo/type.enum');
const vinculoStatus = require('../../service/vinculo/status.enum');

const cession = require('../../service/cessao/index');
// eslint-disable-next-line max-len
const sendNotification = require('../../service/fornecedor/sendNotification.service');
const findCurrentByType = require('../../service/termo/findCurrentByType.util');
const findById = require('../../service/vinculo/findById.util');


module.exports = (
  db,
  siscofWrapper,
  mailer,
  mailerSettings
) => (data, linkId, type, userData) => {
  const validateRecurrentCession = cession.validateRecurrence(db);
  const validateCession = cession.validate;
  const resolveCession = cession.resolve(db, siscofWrapper);
  const notifyCession = cession.notificate(
    mailer, emailTemplates, mailerSettings
  );

  const findLinks = findById(db, siscofWrapper);
  const sendMail = sendNotification(db, mailer, mailerSettings);
  const findCurrentTerm = findCurrentByType(db);

  const validaVinculo = (vinculo) => {
    if (!vinculo) throw String('vinculo-nao-encontrado');

    if (vinculo.participanteEstabelecimentoId !== +userData.participante
      && vinculo.participanteFornecedorId !== +userData.participante) {
      throw String('nao-autorizado');
    }

    return Promise.resolve(vinculo);
  };

  const validaCessao = (vinculo) => {
    const { valor } = data;
    const dataVencimento = new Date(data.dataVencimento);
    const dataExpiracao = new Date(data.dataExpiracao);

    const valorMaximo = data.valorMaximoRecorrente;
    const dataFinalVigencia = new Date(data.dataFinalVigencia);
    const user = userData;

    const preValidacao = type === cessaoTipo.recorrenteAprovacaoAutomatica
      ? () => {
        try {
          validateRecurrentCession(
            valor,
            dataVencimento,
            valorMaximo,
            dataFinalVigencia,
            user,
            vinculo
          );
          return Promise.resolve();
        } catch (error) {
          return Promise.reject(error);
        }
      }
      : Promise.resolve();

    return preValidacao
      .then(() => validateCession(
        valor, dataExpiracao, dataVencimento, vinculo
      ))
      .then(() => vinculo);
  };

  const salvarCessaoSiscof = (vinculo) => {
    const cessao = {
      participanteVinculoId: +data.vinculoId,
      usuario: userData.email,
      valorSolicitado: data.valor,
      valorDisponivel: vinculo.valorDisponivel,
      solicitante: userData.name,
      dataVencimento: data.dataVencimento,
      dataExpiracao: data.dataExpiracao,
      referencia: data.referencia,
      tipo: data.tipoCessao,
      diluicaoPagamento: data.tipoDiluicaoPagamento,
    };

    cessao.participanteVinculo = vinculo;

    return siscofWrapper.solicitarCessao(cessao)
      .then((cessaoSiscof) => {
        cessao.codigoCessao = cessaoSiscof.codigoCessao;
        cessao.codigoRetornoSiscof = cessaoSiscof.codigoRetornoSiscof;
        cessao.mensagemRetornoSiscof = cessaoSiscof.mensagemRetornoSiscof;
        cessao.recebiveis = cessaoSiscof.recebiveis;
        cessao.status = cessaoStatus.aguardandoAprovacao;
        return cessao;
      }).catch((cessaoSiscof) => {
        cessao.codigoRetornoSiscof = cessaoSiscof.codigoRetornoSiscof;
        cessao.mensagemRetornoSiscof = cessaoSiscof.mensagemRetornoSiscof;
        cessao.status = cessaoStatus.falha;
        return cessao;
      });
  };

  const salvarCessao = cessao => db.entities.cessao
    .create(cessao)
    .then((c) => {
      cessao = Object.assign(c, cessao);
      return cessao;
    });

  const salvarHistorico = (cessao) => {
    const historico = Object.assign({}, cessao.dataValues);
    historico.cessaoId = historico.id;
    delete historico.id;

    return db.entities.cessaoHistorico.create(historico).then(() => {
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
      db.entities.cessaoRecebivel.bulkCreate(cessao.recebiveis),
      db.entities.cessaoRecebivelHistorico.bulkCreate(
        cessao.recebiveis
      ),
    ]);

    return create.then(() => cessao);
  };

  const aprovarCessaoRecorrente = (cessao, recorrencia) => {
    const getParticipante = id => db.entities.participante.findOne({
      where: {
        id,
      },
      attributes: ['id', 'nome'],
      include: [{
        model: db.entities.participanteContato,
        as: 'contatos',
        attributes: ['id', 'email'],
        where: {
          ativo: true,
        },
      }],
    });

    return findCurrentTerm(termoTipo.aditivo)
      .then((termo) => {
        if (!termo) throw String('termo-invalido');

        return Promise.all([
          getParticipante(
            cessao.participanteVinculo.participanteEstabelecimentoId
          ),
          getParticipante(
            cessao.participanteVinculo.participanteFornecedorId
          ),
          resolveCession(
            true, cessao, termo.id, recorrencia, userData.email
          ),
        ]);
      })
      .then((results) => {
        const estabelecimento = results[0];
        const fornecedor = results[1];

        return notifyCession(
          true,
          cessao.codigoCessao,
          estabelecimento.nome,
          estabelecimento.contatos[0].email,
          fornecedor.nome,
          fornecedor.contatos[0].email
        );
      });
  };

  const finalizar = (cessao) => {
    let promise = null;
    const { recorrentes } = cessao.participanteVinculo;

    if (cessao.tipo === cessaoTipo.recorrenteAprovacaoAutomatica
      && recorrentes.length > 0
      && recorrentes[0].status === vinculoStatus.aprovado) {
      promise = aprovarCessaoRecorrente(
        cessao, cessao.participanteVinculo.recorrentes[0]
      );
    } else {
      promise = sendMail(cessao);
    }

    return promise.then(() => cessao.id);
  };

  const now = new Date();
  const today = new Date(
    now.getFullYear(), now.getMonth(), now.getDate()
  );

  return findLinks(linkId, [{
    model: db.entities.participanteVinculoRecorrente,
    as: 'recorrentes',
    where: {
      status: [vinculoStatus.pendente, vinculoStatus.aprovado],
      dataFinalVigencia: {
        $gte: today,
      },
    },
    required: false,
  }, {
    model: db.entities.cessao,
    as: 'cessoes',
    where: {
      tipo: cessaoTipo.recorrenteAprovacaoAutomatica,
      status: [
        cessaoStatus.aguardandoAprovacao,
        cessaoStatus.aprovado,
      ],
    },
    required: false,
  }])
    .then(validaVinculo)
    .then(validaCessao)
    .then(salvarCessaoSiscof)
    .then(salvarCessao)
    .then(salvarHistorico)
    .then(salvarRecebiveis)
    .then(finalizar);
};
