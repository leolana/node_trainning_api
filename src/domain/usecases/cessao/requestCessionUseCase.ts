import cessaoTypeEnum from '../../services/cessao/cessaoTypeEnum';
import cessaoStatusEnum from '../../services/cessao/cessaoStatusEnum';
import termoTypeEnum from '../../services/termo/termoTypeEnum';
import participanteVinculoStatus from '../../entities/participanteVinculoStatus';
import * as cession from '../../services/cessao';
import sendNotification from '../../services/cessao/sendNotification';
import findCurrentByType from '../../services/termo/findCurrentByType';
import findById from '../../services/vinculo/findById';
import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';

import { LoggerInterface } from '../../../infra/logging';
import { Sequelize } from 'sequelize-typescript';
import { SiscofWrapper } from '../../../infra/siscof';
import { Mailer } from '../../../infra/mailer';

const requestCessionUseCase = (
  db: Sequelize,
  siscofWrapper: SiscofWrapper,
  mailer: Mailer,
  mailerSettings: any,
  logger: LoggerInterface
) => async (data: any, linkId: any, type: any, userData: any) => {
  const validateRecurrentCession = cession.validateRecurrence(db);
  const validateCession = cession.validate;
  const resolveCession = cession.resolve(db, siscofWrapper);
  const notifyCession = cession.notificate(mailer, mailer.emailTemplates, mailerSettings, logger);
  const findLinks = findById(db, siscofWrapper);
  const sendMail = sendNotification(db, mailer, mailerSettings, logger);

  const findCurrentTerm = findCurrentByType(db);
  const aprovarCessaoRecorrente = async (cessaoRecorrent, recorrencia) => {
    const termo = await findCurrentTerm(termoTypeEnum.aditivo);
    if (!termo) throw new Exceptions.InvalidTermException();

    await resolveCession(true, cessaoRecorrent, termo.id, recorrencia, userData.email);

    const getParticipante = (id: number) => (db.models as any).Participante.findOne({
      where: {
        id,
      },
      attributes: ['id', 'nome'],
      include: [{
        model: (db.models as any).ParticipanteContato,
        as: 'contatos',
        attributes: ['id', 'email'],
        where: {
          ativo: true,
        },
      }],
    });
    const estabelecimento = await getParticipante(cessaoRecorrent.participanteVinculo.participanteEstabelecimentoId);
    const fornecedor = await getParticipante(cessaoRecorrent.participanteVinculo.participanteFornecedorId);
    return notifyCession(
      true,
      cessaoRecorrent.codigoCessao,
      estabelecimento.nome,
      estabelecimento.contatos[0].email,
      fornecedor.nome,
      fornecedor.contatos[0].email
    );
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const vinculo = await findLinks(linkId, [{
    model: (db.models as any).ParticipanteVinculoRecorrente,
    as: 'recorrentes',
    where: {
      status: [participanteVinculoStatus.pendente, participanteVinculoStatus.aprovado],
      dataFinalVigencia: {
        $gte: today,
      },
    },
    required: false,
  }, {
    model: (db.models as any).Cessao,
    as: 'cessoes',
    where: {
      tipo: cessaoTypeEnum.recorrenteAprovacaoAutomatica,
      status: [
        cessaoStatusEnum.aguardandoAprovacao,
        cessaoStatusEnum.aprovado,
      ],
    },
    required: false,
  }]);

  if (vinculo.participanteEstabelecimentoId !== +userData.participante
    && vinculo.participanteFornecedorId !== +userData.participante) {
    throw new Exceptions.NotAuthorizedException();
  }

  const { valor } = data;
  const dataVencimento = new Date(data.dataVencimento);
  const valorMaximo = data.valorMaximoRecorrente;
  const dataFinalVigencia = new Date(data.dataFinalVigencia);
  const user = userData;
  if (type === cessaoTypeEnum.recorrenteAprovacaoAutomatica) {
    await validateRecurrentCession(
      valor,
      dataVencimento,
      valorMaximo,
      dataFinalVigencia,
      user,
      vinculo
    );
  }

  const dataExpiracao = new Date(data.dataExpiracao);
  validateCession(valor, dataExpiracao, dataVencimento, vinculo);

  const cessao: any = {
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
  try {
    const cessaoSolicitada = await siscofWrapper.solicitarCessao(cessao);
    cessao.codigoCessao = cessaoSolicitada.codigoCessao;
    cessao.codigoRetornoSiscof = cessaoSolicitada.codigoRetornoSiscof;
    cessao.mensagemRetornoSiscof = cessaoSolicitada.mensagemRetornoSiscof;
    cessao.recebiveis = cessaoSolicitada.recebiveis;
    cessao.status = cessaoStatusEnum.aguardandoAprovacao;

  } catch (err) {
    cessao.codigoRetornoSiscof = err.codigoRetornoSiscof;
    cessao.mensagemRetornoSiscof = err.mensagemRetornoSiscof;
    cessao.status = cessaoStatusEnum.falha;
  }

  const cessaoCriada = await (db.models as any).Cessao.create(cessao);
  const cessaoSalva = Object.assign(cessaoCriada, cessao);

  const historico = Object.assign({}, cessaoSalva.dataValues);
  historico.cessaoId = historico.id;
  delete historico.id;

  await (db.models as any).CessaoHistorico.create(historico);
  if (cessaoSalva.status === cessaoStatusEnum.falha) {
    throw new Error(cessaoSalva.mensagemRetornoSiscof);
  }

  if (cessaoSalva.status !== cessaoStatusEnum.falha) {
    cessaoSalva.recebiveis.forEach((recebivel) => {
      recebivel.cessaoId = cessaoSalva.id;
    });

    await Promise.all([
      (db.models as any).CessaoRecebivel.bulkCreate(cessaoSalva.recebiveis),
      (db.models as any).CessaoRecebivelHistorico.bulkCreate(
        cessaoSalva.recebiveis
      ),
    ]);
  }

  const { recorrentes } = cessaoSalva.participanteVinculo;

  if (cessaoSalva.tipo === cessaoTypeEnum.recorrenteAprovacaoAutomatica
    && recorrentes.length > 0
    && recorrentes[0].status === participanteVinculoStatus.aprovado) {
    await aprovarCessaoRecorrente(cessaoSalva, cessaoSalva.participanteVinculo.recorrentes[0]);
  } else {
    await sendMail(cessaoSalva);
  }

  return cessaoSalva.id;
};

export default requestCessionUseCase;
