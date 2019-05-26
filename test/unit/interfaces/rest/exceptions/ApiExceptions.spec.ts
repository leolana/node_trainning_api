import * as Exceptions from '../../../../../src/interfaces/rest/exceptions/ApiExceptions';
import * as Errors from '../../../../../src/interfaces/rest/errors/ApiErrors';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';

describe('Interfaces :: Rest :: Exceptions :: ApiExceptions', () => {

  const customErrors: any[] = Object.values(Errors);
  const customExceptions: any[] = Object.values(Exceptions);

  test('Every custom exception should be instance of some custom error', (done) => {
    customExceptions.forEach((customException) => {

      const fromCustomError = customErrors
        .some(customError => customException.prototype instanceof customError);

      if (!fromCustomError) {
        console.error(customException);
      }

      expect(fromCustomError).toBe(true);
    });

    done();
  });

  test('Every custom exception should not be status 500', (done) => {
    customExceptions.forEach((customException) => {
      const exception = new customException();
      expect(exception.status).not.toBe(INTERNAL_SERVER_ERROR);
    });
    done();
  });

  test('Every custom exception should have a message', (done) => {
    customExceptions.forEach((customException) => {
      const exception = new customException();
      expect(exception.message.length).toBeGreaterThan(0);
    });
    done();
  });

});
