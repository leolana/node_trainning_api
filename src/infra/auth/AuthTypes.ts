export interface KeycloakMapRepresentation {
  manageGroupMembership?: boolean;
  view?: boolean;
  mapRoles?: boolean;
  impersonate?: boolean;
  manage?: boolean;
}

export interface KeycloakUserRepresentation {
  id?: string;
  createdTimestamp?: number;
  username?: string;
  enabled?: boolean;
  totp?: boolean;
  emailVerified?: boolean;
  email?: string;
  disableableCredentialTypes?: string[];
  requiredActions?: string[];
  notBefore?: number;
  access?: KeycloakMapRepresentation;
}
