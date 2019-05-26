import * as Exceptions from '../../../interfaces/rest/exceptions/ApiExceptions';
import { MovideskPerson, getMovideskTipoPessoa, MovideskTipoPerfil } from '../../../infra/movidesk/PersonTypes';
import uuid = require('uuid');

/**
 * Retorna o objeto no formato da model MovideskPerson
 * usando os dados da model do postgres de (participante)
 *
 * @param participante A model do postgres do (participante) contendo as associações (cidade) e (contatos)
 * @param userEmail Email do usuário responsável pela criação da model MovideskPerson
 */
const mapMovideskPersonDataFromParticipanteUseCase = async (
  participante: any,
  userEmail: string
) => {

  if (!participante) {
    throw new Exceptions.MissingDocumentException();
  }

  const uuidIntegracao = uuid.v4();

  return <MovideskPerson>{
    id: uuidIntegracao,
    codeReferenceAdditional: participante.id,
    isActive: participante.ativo,
    personType: getMovideskTipoPessoa(participante.documento),
    profileType: MovideskTipoPerfil.Cliente,
    accessProfile: '',
    corporateName: participante.razaoSocial,
    businessName: participante.nome,
    cpfCnpj: participante.documento,
    userName: participante.documento,
    password: participante.documento,
    cultureId: 'pt-BR',
    timeZoneId: 'America/Sao_Paulo',
    createdDate: new Date(),
    createdBy: userEmail,
    observations: uuidIntegracao,
    addresses: [
      {
        addressType: 'Comercial',
        country: 'Brasil',
        postalCode: participante.cep,
        state: participante.cidade.estado,
        city: participante.cidade.nome,
        district: participante.bairro,
        street: participante.logradouro,
        number: participante.numero,
        complement: participante.complemento,
        reference: '',
        isDefault: true,
      }
    ],
    contacts: [
      {
        contactType: 'Telefone',
        contact: participante.telefone,
        isDefault: true,
      },
      ...participante.contatos.map((contato: any) => ({
        contactType: 'Celular',
        contact: contato.celular,
        isDefault: false
      }))
    ],
    emails: participante.contatos.map((contato: any, index: number) => ({
      emailType: 'Profissional',
      email: contato.email,
      isDefault: index === 0,
    })),
    relationships: []
  };
};

export default mapMovideskPersonDataFromParticipanteUseCase;
