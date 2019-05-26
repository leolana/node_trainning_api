import { Sequelize } from 'sequelize-database';
import { CredenciamentoServices } from '../../services/credenciamento';
import { LoggerInterface } from '../../../infra/logging';
import { CredenciamentoEditUseCases } from './edit';

const editUseCase = (
  db: Sequelize,
  logger: LoggerInterface,
  credenciamentoEditUseCases: CredenciamentoEditUseCases,
  credenciamentoServices: CredenciamentoServices
) =>

  /**
   * Recebe o (credenciamentoEdicao) dos steps do wizard. Encontra o participante e o credenciamento no postgres
   * para serem alterados. Valida o status e o documento do credenciamento. Inativa o credenciamento encontrado.
   * Salva um novo credenciamento e um novo participante com os dados de (credenciamentoEdicao), junto com as
   * associações de cada. Envia email caso tenha tido alteração de dados bancários ou de taxas.
   *
   * @param credenciamentoEdicao Os dados do credenciamento que foi editado nos steps do wizard.
   * @param files Os arquivos do credenciamento.
   * @param documento CPF ou CNPJ.
   * @param userEmail O email do usuário responsável pela edição.
   * @param unchangedFiles Um objeto com os arquivos que não foram modificados.
   */
  async (
    credenciamentoEdicao: any,
    files: any[],
    documento: string,
    userEmail: string,
    unchangedFiles: any = {}
  ) => {

    const {
      participanteExistente,
      credenciamentoAnterior
    } = await credenciamentoEditUseCases.findAccreditationParticipant(
      credenciamentoEdicao.dadosCadastrais.id
    );

    await credenciamentoEditUseCases.validateAccreditationBeforeEdit(
      credenciamentoAnterior.status,
      credenciamentoAnterior.documento,
      documento
    );

    const ratesChanged = await credenciamentoEditUseCases.setAccreditationNewRateValues(
      credenciamentoAnterior,
      credenciamentoEdicao
    );

    credenciamentoEdicao.credenciamento = { createdAt: credenciamentoAnterior.createdAt };

    const transaction = await db.transaction();
    let participanteNovo = null;

    try {
      await credenciamentoEditUseCases.inactivatePreviousAccreditation(
        participanteExistente.id,
        credenciamentoAnterior,
        userEmail,
        transaction
      );

      if ((credenciamentoAnterior.arquivos.analises || []).length > 0) {
        unchangedFiles.analises = credenciamentoAnterior.arquivos.analises;
      }

      const { id: credenciamentoId } = await credenciamentoServices.mutateService(
        credenciamentoEdicao,
        credenciamentoAnterior.status,
        files,
        documento,
        userEmail,
        unchangedFiles,
        transaction
      );

      const credenciamento = await credenciamentoServices.findService(
        credenciamentoId,
        transaction
      );

      await credenciamentoEditUseCases.updateParticipantRate(
        participanteExistente.id,
        credenciamento,
        credenciamentoEdicao.condicaoComercial.antecipacao,
        userEmail,
        transaction
      );

      participanteNovo = await credenciamentoServices.approveService(
        credenciamento,
        participanteExistente,
        userEmail,
        transaction
      );

      transaction.commit();

    } catch (error) {
      transaction.rollback();
      throw error;
    }

    const bankingDataChanged = await credenciamentoEditUseCases.checkIfBankingDataChanged(
      participanteExistente,
      participanteNovo
    );

    try {
      await credenciamentoEditUseCases.sendEmailAccreditationDataChanged(
        participanteExistente.nome,
        participanteNovo.id,
        userEmail,
        ratesChanged,
        bankingDataChanged
      );
    } catch (e) {
      logger.error(`Falha ao enviar email ao participante ${participanteNovo.id} sobre alteração do credenciamento.`);
      logger.error(e);
    }

    return participanteNovo;
  };

export default editUseCase;
