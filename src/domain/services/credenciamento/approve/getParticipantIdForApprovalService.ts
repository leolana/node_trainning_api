import { Sequelize } from 'sequelize-database';
import deformatDocument from '../deformatDocument';

const getParticipantIdForApprovalService = (
  db: Sequelize
) =>

  /**
   * Caso não tenha um participante existente para poder pegar seu id,
   * procura na tabela (participanteExistenteSiscof) pelo documento
   * se já existe esse participante no siscof
   *
   * @param participanteExistente objeto da model de participante ou null
   * @param participanteNovo objeto da model de participante que será atualizada/criada
   */
  async (
    participanteExistente: any,
    participanteNovo: any
  ) => {

    if (participanteExistente) {
      participanteNovo.id = participanteExistente.id;
      return;
    }

    const found = await db.entities.participanteExistenteSiscof.findOne({
      where: {
        documento: deformatDocument(participanteNovo.documento)
      }
    });

    if (found) {
      participanteNovo.id = found.participanteId;
    }
  };

export default getParticipantIdForApprovalService;
