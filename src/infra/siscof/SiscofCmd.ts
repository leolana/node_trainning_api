import { injectable, inject } from 'inversify';

import SiscofDb from './SiscofDb';

import types from '../../constants/types';

const printLog = true;

const log = (name, message = null) => {
  if (printLog) {
    console.log(name, message);
  }
};

@injectable()
class SiscofCmd {
  private db: SiscofDb;

  constructor(
    @inject(types.SiscofDb) db: SiscofDb
  ) {
    this.db = db;
  }

  executeCommand = (query, params, name) => {
    const deniedWords = [
      'DELETE',
      'UPDATE',
      'INSERT',
      'DROP',
      'GRANT',
      'CREATE',
      'ALTER',
      'TABLE',
      'TRUNCATE'
    ];

    if (new RegExp(deniedWords.join('|')).test(query.toUpperCase())) {
      log(['QUERY COM PALAVA RESERVADA', query, params]);
      return null;
    }

    log([`${name}..input=`, query, params]);
    return this.db
      .connectByPool()
      .then((connection: any) => {
        log(`${name}..before-execute`);
        return connection
            .execute(query, params)
            .then((result: any) => {
              log(`${name}..output-close-connection=`, result);
              connection.close();
              log(`${name}.output=`, result);
              return result;
            })
            // Em testes quando deu erro não estava liberando as conexões sem esse catch
            .catch((err) => {
              log('.catch=', err);
              connection.close();
              throw err;
            });
      });
  }
}

export default SiscofCmd;
