import { injectable } from 'inversify';

import SiscofDbDev from './SiscofDbDev';
import SiscofDb from './SiscofDb';

@injectable()
class SiscofDbBootstrapper {
  create(): SiscofDb {
    return this.connectDev();
  }

  private connectDev(): SiscofDb {
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
