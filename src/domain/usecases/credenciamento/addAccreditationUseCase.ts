import { Sequelize } from 'sequelize-database';
import { CredenciamentoServices } from '../../services/credenciamento';
import deformatDocument from '../../services/credenciamento/deformatDocument';
import credenciamentoStatusEnum from '../../entities/credenciamentoStatusEnum';

const addAccreditationUseCase = (
  db: Sequelize,
  credenciamentoServices: CredenciamentoServices
) =>

  /**
   * A partir dos dados e arquivos do front que vem do wizard,
   * cria um novo registro de credenciamento no postgres.
   *
   * @param dadosCredenciamento O objeto com os dados do credenciamento que está sendo adicionado/editado.
   * @param files Array de arquivos do credenciamento.
   * @param documento CPF ou CNPJ
   * @param userEmail O email do usuário responsável pela edição/inclusão.
   */
  async (
    dadosCredenciamento: any,
    files: any[],
    documento: string,
    userEmail: string
  ) => {

    const transaction = await db.transaction();
    let created = null;

    try {
      created = await credenciamentoServices.mutateService(
        dadosCredenciamento,
        credenciamentoStatusEnum.pendente,
        files,
        deformatDocument(documento),
        userEmail,
        transaction
      );

      transaction.commit();

    } catch (error) {
      transaction.rollback();
      throw error;
    }

    return created;

  };

export default addAccreditationUseCase;
