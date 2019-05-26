import * as Errors from '../errors/ApiErrors';

export class NotAvailableOptionException extends Errors.PreconditionFailedError {
  constructor() {
    super('option-not-available');
  }
}

export class InvalidRecurrencyStatusException extends Errors.PreconditionFailedError {
  constructor() {
    super('status-recorrencia-invalido');
  }
}

export class InvalidCessionStatusException extends Errors.PreconditionFailedError {
  constructor() {
    super('status-cessao-invalido');
  }
}

export class InvalidRecurrencyException extends Errors.PreconditionFailedError {
  constructor() {
    super('recorrencia-invalida');
  }
}

export class ExistentePendingCessionException extends Errors.ConflictError {
  constructor() {
    super('cessao-pendente-existente');
  }
}

export class ExistentePendingCessionThisMonthException extends Errors.ConflictError {
  constructor() {
    super('cessao-recorrente-existente-no-mes');
  }
}

export class ExpiredRecurrencyException extends Errors.PreconditionFailedError {
  constructor() {
    super('recorrencia-expirada');
  }
}

export class RequestestedValueAboveAvailableException extends Errors.PreconditionFailedError {
  constructor() {
    super('valor-solicitado-superior-valor-disponivel');
  }
}

export class ExpirationDateBeforeNextTwoDaysException extends Errors.PreconditionFailedError {
  constructor() {
    super('data-expiracao-anterior-prox-dois-dia');
  }
}

export class MaturityDateBeforeNextTwoDaysException extends Errors.PreconditionFailedError {
  constructor() {
    super('data-vencimento-anterior-prox-dois-dias');
  }
}

export class ExpirationDateAfterMaturityException extends Errors.PreconditionFailedError {
  constructor() {
    super('data-expiracao-posterior-vencimento');
  }
}

export class ExpirationDateUnderThirtyDaysException extends Errors.PreconditionFailedError {
  constructor() {
    super('data-expiracao-inferior-30-dias');
  }
}

export class ExistentCessionOnRecurrentMonthException extends Errors.ConflictError {
  constructor() {
    super('cessao-recorrente-existente-no-mes-vencimento');
  }
}

export class RequestedValueAboveRecurrentValueException extends Errors.PreconditionFailedError {
  constructor() {
    super('valor-solicitado-superior-valor-recorrente');
  }
}

export class InvalidTermException extends Errors.PreconditionFailedError {
  constructor() {
    super('termo-invalido');
  }
}

export class NotAuthorizedException extends Errors.UnauthorizedError {
  constructor() {
    super('nao-autorizado');
  }
}

export class BondNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('vinculo-nao-encontrado');
  }
}

export class PreAccreditationAlreadyExistsException extends Errors.ConflictError {
  constructor() {
    super('pre-credenciamento-existente');
  }
}

export class LoginFailedException extends Errors.PreconditionFailedError {
  constructor() {
    super('email-senha-invalido');
  }
}

export class NotificationCategoryNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('notification-category-not-found');
  }
}

export class NotImplementedException extends Errors.NotImplementedError {
  constructor() {
    super('not-implemented');
  }
}

export class InviteNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('invite-not-found');
  }
}

export class AccreditationNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('credenciamento-nao-localizado');
  }
}

export class InvalidAccreditationStatusException extends Errors.PreconditionFailedError {
  constructor() {
    super('credenciamento-status-invalido');
  }
}

export class MissingDocumentException extends Errors.PreconditionFailedError {
  constructor() {
    super('missing-document');
  }
}

export class EmptyResultFromMovideskException extends Errors.BadRequestError {
  constructor() {
    super('empty-result-from-movidesk');
  }
}

export class ParticipanteNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('participante-nao-encontrado');
  }
}

export class InvalidParticipanteIdException extends Errors.PreconditionFailedError {
  constructor() {
    super('invalid-participante-id');
  }
}

export class MissingAccreditationIdException extends Errors.PreconditionFailedError {
  constructor() {
    super('missing-credenciamento-id');
  }
}

export class AccessDeniedException extends Errors.UnauthorizedError {
  constructor() {
    super('access-denied');
  }
}

export class UserIsAlreadyAMemberException extends Errors.ConflictError {
  constructor() {
    super('usuario-ja-e-membro');
  }
}

export class KeycloakException extends Errors.BadRequestError {
  constructor(methodName: string) {
    super(`error-keycloak-${formatAsTagName(methodName)}`);
  }
}

function formatAsTagName(str: string) {
  return String(str)
    .replace(/(?!^)[A-Z]/g, c => `-${c.toLowerCase()}`)
    .replace(/password/g, 'pass');
}

export class NoRoleSuppliedException extends Errors.BadRequestError {
  constructor() {
    super('no-role-supplied');
  }
}

export class UserAlreadyExistsException extends Errors.ConflictError {
  constructor() {
    super('usuario-existente');
  }
}

export class UserNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('usuario-not-found');
  }
}

export class KeycloakUserNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('usuario-keycloak-not-found');
  }
}

export class InvalidTypeOfPersonException extends Errors.NotFoundError {
  constructor() {
    super('tipoPessoa-invalido');
  }
}

export class InviteAlreadyExistsException extends Errors.ConflictError {
  constructor() {
    super('convite-existente');
  }
}

export class InvalidSentDataException extends Errors.BadRequestError {
  constructor() {
    super('invalid-sent-data');
  }
}

export class EmptyReceivablesListException extends Errors.NotAcceptableError {
  constructor() {
    super('lista-recebiveis-vazia');
  }
}

export class RegisterNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('registro-nao-encontrado');
  }
}

export class AccreditationDocumentDiferentException extends Errors.BadRequestError {
  constructor() {
    super('documento-informado-diferente-do-existente');
  }
}

export class InvalidDebitRateException extends Errors.BadRequestError {
  constructor() {
    super('taxa-debito-invalida');
  }
}
export class InvalidAdministrativeRateException extends Errors.BadRequestError {
  constructor() {
    super('taxa-administrativa-invalida');
  }
}

export class InvalidPersonTypeException extends Errors.BadRequestError {
  constructor() {
    super('tipoPessoa-invalido');
  }
}

export class InvalidOpeningDateException extends Errors.BadRequestError {
  constructor() {
    super('dataAberturaNascimento-invalida');
  }
}

export class InvalidPartnerBirthDateException extends Errors.BadRequestError {
  constructor() {
    super('dataAberturaNascimento-socios-invalida');
  }
}
export class CepNotFoundException extends Errors.NotFoundError {
  constructor() {
    super('cep-not-found');
  }
}

export class FornecedorLinked extends Errors.ConflictError {
  constructor() {
    super('fornecedor-ja-vinculado');
  }
}

export class EstabelecimentoLinked extends Errors.ConflictError {
  constructor() {
    super('estabelecimento-ja-vinculado');
  }
}

export class VinculoNotFound extends Errors.NotFoundError {
  constructor() {
    super('vinculo-nao-encontrado');
  }
}
