import deformatDocument from '../../domain/services/credenciamento/deformatDocument';

export enum MovideskTipoPessoa {
  Pessoa = 1,
  Empresa = 2,
  Departamento = 4
}

export enum MovideskTipoPerfil {
  Agente = 1,
  Cliente = 2,
  AgenteCliente = 3
}

export function getMovideskTipoPessoa(documento: string): MovideskTipoPessoa {
  const CPF_LENGTH = 11;
  if (deformatDocument(documento).length === CPF_LENGTH) {
    return MovideskTipoPessoa.Pessoa;
  }
  return MovideskTipoPessoa.Empresa;
}

export interface MovideskPerson {
  id?: string;
  codeReferenceAdditional?: string;
  isActive: boolean;
  personType: MovideskTipoPessoa;
  profileType: MovideskTipoPerfil;
  accessProfile?: string;
  corporateName?: string;
  businessName: string;
  cpfCnpj?: string;
  userName?: string;
  password?: string;
  role?: string;
  bossId?: string;
  bossName?: string;
  classification?: string;
  cultureId?: string;
  timeZoneId?: string;
  authenticateOn?: string;
  createdDate?: Date;
  createdBy?: string;
  changedDate?: Date;
  changedBy?: string;
  observations?: string;
  addresses?: MovideskAddress[];
  contacts?: MovideskContact[];
  emails?: MovideskEmail[];
  teams?: string[];
  relationships?: MovideskRelationship[];
  customFieldValues?: MovideskCustomFieldValue[];
  atAssets?: MovideskAsset[];
}

export interface MovideskAddress {
  addressType: string;
  country?: string;
  postalCode?: string;
  state?: string;
  city?: string;
  district?: string;
  street?: string;
  number?: string;
  complement?: string;
  reference?: string;
  isDefault: boolean;
}

export interface MovideskContact {
  contactType: string;
  contact: string;
  isDefault: boolean;
}

export interface MovideskEmail {
  emailType: string;
  email: string;
  isDefault: boolean;
}

export interface MovideskRelationship {
  id?: string;
  name?: string;
  slaAgreement?: string;
  forceChildrenToHaveSomeAgreement: boolean;
  allowAllServices?: boolean;
  includeInParents?: boolean;
  loadChildOrganizations?: boolean;
  services?: MovideskService[];
}

export interface MovideskService {
  id: number;
  name?: string;
  copyToChildren?: boolean;
}

export interface MovideskCustomFieldValue {
  customFieldId: number;
  customFieldRuleId: number;
  line: number;
  value?: string;
  items?: any[];
}

export interface MovideskItem {
  personId?: number;
  clientId?: number;
  team?: string;
  customFieldItem?: string;
}

export interface MovideskAsset {
  id?: string;
  name?: string;
  label?: string;
}
