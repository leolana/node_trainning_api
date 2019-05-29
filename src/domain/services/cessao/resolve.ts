import cessaoTypeEnum from './cessaoTypeEnum';
import cessaoStatusEnum from './cessaoStatusEnum';
import participanteVinculoStatus from '../../entities/participanteVinculoStatus';
import { InvalidRecurrencyStatusException, InvalidCessionStatusException } from '../../../interfaces/rest/exceptions/ApiExceptions';

const resolve = (db, siscofWrapper) => async (
  aprovado,
  cessao,
  termoId,
  recorrencia,
  user,
) => {
  if (cessao.tipo === cessaoTypeEnum.recorrenteAprovacaoAutomatica) {
    if (!recorrencia) throw new InvalidRecurrencyStatusException();
  }

  if (cessao.status !== cessaoStatusEnum.aguardandoAprovacao) {
    throw new InvalidCessionStatusException();
  }

  const timestamp = new Date();

  cessao.dataRespostaEstabelecimento = timestamp;
  cessao.usuarioRespostaEstabelecimento = user;
  cessao.status = aprovado ? cessaoStatusEnum.aprovado : cessaoStatusEnum.recusado;

  await siscofWrapper.aprovarRecusarCessao(cessao.codigoCessao, cessao.referencia, aprovado);
  const action = db.transaction((t) => {
    const promises = [
      cessao.save({ transaction: t }),
      (db.models as any).cessaoAceite.create(
        {
          termoId,
          cessaoId: cessao.id,
          status: cessao.status,
          usuario: user,
        },
        { transaction: t },
      ),
    ];

    if (recorrencia && recorrencia.status === participanteVinculoStatus.pendente) {
      recorrencia.usuarioAprovadorEstabelecimento = user;
      recorrencia.dataAprovacaoEstabelecimento = timestamp;
      recorrencia.status = aprovado
        ? participanteVinculoStatus.aprovado
        : participanteVinculoStatus.reprovado;
      promises.push(recorrencia.save({ transaction: t }));
    }

    return Promise.all(promises);
  });
  return action;
};

export default resolve;
