import * as oracledb from 'oracledb';
import { injectable } from 'inversify';

import SiscofDbProd from './SiscofDbProd';
import SiscofDbDev from './SiscofDbDev';
import SiscofDb from './SiscofDb';

import { config } from '../../config';

@injectable()
class SiscofDbBootstrapper {
  private settings: any;
  constructor() {
    this.settings = config.siscof;
  }

  connectProd(): SiscofDb {
    const pool = oracledb.createPool(this.settings);

    const constants = {};

    // Encapsular todas as constantes para fora do objeto oracle
    for (const prop in oracledb) {
      if (typeof(oracledb[prop]) === 'number' || typeof(oracledb[prop]) === 'string') {
        constants[prop] = oracledb[prop];
      }
    }

    return new SiscofDbProd(
      constants,
      pool
    );
  }

  connectDev(): SiscofDb {
    const constants = {
      // Tipos OutFormat
      ARRAY: 4001,
      OBJECT: 4002,
      // Tipos Oracle-Node
      BLOB: 2007,
      BUFFER: 2005,
      CLOB: 2006,
      CURSOR: 2004,
      DATE: 2003,
      DEFAULT: 0,
      NUMBER: 2002,
      STRING: 2001,
      // Tipos Bind
      BIND_IN: 3001,
      BIND_INOUT: 3002,
      BIND_OUT: 3003,
    };

    return new SiscofDbDev(
      constants
    );
  }
}

export default SiscofDbBootstrapper;
