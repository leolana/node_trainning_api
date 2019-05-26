import rateTypeEnum from '../../participante/rateTypeEnum';

/**
 * Mapeia os dados necessários do credenciamento para a criação de um participante.
 * Remove os seguintes campos para não conflitar: "id", "createdAt" e "updatedAt".
 *
 * @param credenciamento O objeto da model de credenciamento
 * @param userEmail O email do usuário responsável pela aprovação
 */
const getParticipantFromAccreditationDataForApprovalService = async (
  credenciamento: any,
  userEmail: string
) => {

  const participante = {
    ...credenciamento.dataValues,
    usuario: userEmail,
  };
  delete participante.id;
  delete participante.createdAt;
  delete participante.updatedAt;

  participante.contatos = [credenciamento.contato.dataValues];
  delete participante.contatos[0].id;

  participante.socios = credenciamento.socios.map((socio: any) => {
    delete socio.dataValues.id;
    return socio.dataValues;
  });

  participante.domiciliosBancarios = credenciamento.domiciliosBancarios.map((domicilioBancario: any) => {
    delete domicilioBancario.dataValues.id;
    return domicilioBancario.dataValues;
  });

  participante.taxas = [{
    valorInicio: null,
    valorFim: null,
    taxa: participante.taxaContratual.antecipacao,
    usuarioCriacao: userEmail,
    participanteTaxaTipo: rateTypeEnum.antecipacao,
  }];

  return participante;
};

export default getParticipantFromAccreditationDataForApprovalService;
