import { injectable } from 'inversify';

import SiscofDb from './SiscofDb';

const printLog = true;
const log = (name, message = null) => {
  if (printLog) {
    console.log(name, message);
  }
};

@injectable()
class SiscofDbProd implements SiscofDb {
  constants; any;
  pool: any;
  constructor(
    constants: any,
    pool: any,
  ) {
    this.constants = constants;
    this.pool = pool;
  }
  connectByPool = () => {
    return this.pool
      .then((pooled) => {
        log('.connect-by-pool');
        if (this.pool._enableStats) pooled._logStats();
        return pooled.getConnection();
      });
  }
}

export default SiscofDbProd;
