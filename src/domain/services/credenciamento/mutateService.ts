import { Transaction } from 'sequelize';

import applyFiles from './applyFiles';
import { CredenciamentoMutateServices } from './mutate';
import credenciamentoStatusEnum from '../../entities/credenciamentoStatusEnum';

const mutateService = (
  credenciamentoMutateServices: CredenciamentoMutateServices
) =>

  /**
 * A partir dos dados e arquivos do front que vem do wizard:
 * 1. Mapeia a model de credenciamento
 * 2. Mapeia também os arquivos após fazer upload caso necessário
 * 3. Reflete o novo credenciamento, criando um novo registro no postgres
 *
 * @param credenciamentoEdicao O objeto com os dados do credenciamento que está sendo adicionado/editado.
 * @param statusCredenciamento O status do credenciamento que está sendo incluído/editado.
 * @param files Array de arquivos do credenciamento.
 * @param documento CPF ou CNPJ
 * @param userEmail O email do usuário responsável pela edição/inclusão.
 * @param unchangedFiles Objeto com arquivos não alterados.
 * @param transaction A transação em aberto do postgres.
 */
  async (
    credenciamentoEdicao: any,
    statusCredenciamento: credenciamentoStatusEnum,
    files: any[],
    documento: string,
    userEmail: string,
    unchangedFiles: any = null,
    transaction: Transaction = null
  ) => {

    await credenciamentoMutateServices.validateAccreditation(
      credenciamentoEdicao
    );

    const credenciamento = await credenciamentoMutateServices.mapAccreditationFromWizardSteps(
      credenciamentoEdicao,
      statusCredenciamento,
      documento,
      userEmail
    );

    const uploadedFiles = await credenciamentoMutateServices.uploadAccreditationFiles(
      files,
      documento
    );

    applyFiles(
      uploadedFiles,
      credenciamento
    );

    await credenciamentoMutateServices.mapAccreditationFiles(
      credenciamento,
      uploadedFiles,
      unchangedFiles
    );

    return await credenciamentoMutateServices.createAccreditation(
      credenciamento,
      transaction
    );

  };

export default mutateService;
