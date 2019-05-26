export enum TipoPessoa {
  Pessoa = 1,
  Empresa = 2,
  Departamento = 4
}

export enum TipoPerfil {
  Agente = 1,
  Cliente = 2,
  AgenteCliente = 3
}

export function getTipoPessoa(documento: string): TipoPessoa {
  const CPF_LENGTH = 11;

  if (String(documento).length === CPF_LENGTH) {
    return TipoPessoa.Pessoa;
  }
  return TipoPessoa.Empresa;
}

export interface Person {
  id?: string;
  codeReferenceAdditional?: string;
  isActive: boolean;
  personType: TipoPessoa;
  profileType: TipoPerfil;
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
  addresses?: Address[];
  contacts?: Contact[];
  emails?: Email[];
  teams?: string[];
  relationships?: Relationship[];
  customFieldValues?: CustomFieldValue[];
  atAssets?: Asset[];
}

export interface Address {
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

export interface Contact {
  contactType: string;
  contact: string;
  isDefault: boolean;
}

export interface Email {
  emailType: string;
  email: string;
  isDefault: boolean;
}

export interface Relationship {
  id?: string;
  name?: string;
  slaAgreement?: string;
  forceChildrenToHaveSomeAgreement: boolean;
  allowAllServices?: boolean;
  includeInParents?: boolean;
  loadChildOrganizations?: boolean;
  services?: Service[];
}

export interface Service {
  id: number;
  name?: string;
  copyToChildren?: boolean;
}

export interface CustomFieldValue {
  customFieldId: number;
  customFieldRuleId: number;
  line: number;
  value?: string;
  items?: any[];
}

export interface Item {
  personId?: number;
  clientId?: number;
  team?: string;
  customFieldItem?: string;
}

export interface Asset {
  id?: string;
  name?: string;
  label?: string;
}
