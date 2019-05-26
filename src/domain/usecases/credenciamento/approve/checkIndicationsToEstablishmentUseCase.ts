import { Transaction } from 'sequelize';
import { Sequelize } from 'sequelize-database';
import participanteIndicacaoStatus from '../../../entities/participanteIndicacaoStatus';
import { vinculoConfig } from '../../../services/vinculo/vinculoConfig';
import participanteVinculoStatus from '../../../entities/participanteVinculoStatus';
import deformatDocument from '../../../services/credenciamento/deformatDocument';

const checkIndicationsToEstablishmentUseCase = (
  db: Sequelize
) =>

  /**
   * Busca as indicações feitas por fornecedores para esse participante estabelecimento, atualiza
   * as indicações, e cria os vínculos com status de pendente para cada fornecedor que o convidou.
   */
  async (
    participanteId: number,
    participanteDocumento: string,
    userEmail: string,
    transaction: Transaction
  ) => {

    const indicacoes = await db.entities.participanteIndicacao.findAll({
      attributes: ['id', 'participanteId', 'usuario'],
      where: {
        documento: deformatDocument(participanteDocumento)
      }
    });

    await Promise.all([
      ...indicacoes.map(indicacao => indicacao.update(
        {
          usuarioResposta: userEmail,
          status: participanteIndicacaoStatus.aprovado,
          dataFimIndicacao: new Date(),
        },
        { transaction }
      )),

      ...indicacoes.map(indicacao => db.entities.participanteVinculo.create(
        {
          participanteEstabelecimentoId: participanteId,
          participanteFornecedorId: indicacao.participanteId,
          usuario: indicacao.usuario,
          exibeValorDisponivel: true,
          diasAprovacao: vinculoConfig.defaultApprovingDays,
          estabelecimentoSolicitouVinculo: false,
          status: participanteVinculoStatus.pendente,
        },
        { transaction }
      ))
    ]);

  };

export default checkIndicationsToEstablishmentUseCase;
