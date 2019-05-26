import * as HttpStatusCodes from 'http-status-codes';

export class ApiError extends Error {
  constructor(tag: string, public status: number) {
    super(tag);
  }
}

export class BadRequestError extends ApiError {
  constructor(tag: string) {
    super(tag, HttpStatusCodes.BAD_REQUEST);
  }
}

export class PreconditionFailedError extends ApiError {
  constructor(tag: string) {
    super(tag, HttpStatusCodes.PRECONDITION_FAILED);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(tag: string) {
    super(tag, HttpStatusCodes.UNAUTHORIZED);
  }
}

export class ConflictError extends ApiError {
  constructor(tag: string) {
    super(tag, HttpStatusCodes.CONFLICT);
  }
}

export class NotFoundError extends ApiError {
  constructor(tag: string) {
    super(tag, HttpStatusCodes.NOT_FOUND);
  }
}

export class NotAcceptableError extends ApiError {
  constructor(tag: string) {
    super(tag, HttpStatusCodes.NOT_ACCEPTABLE);
  }
}

export class NotImplementedError extends ApiError {
  constructor(tag: string) {
    super(tag, HttpStatusCodes.NOT_IMPLEMENTED);
  }
}
