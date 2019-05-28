import { injectable } from 'inversify';

import SiscofDb from './SiscofDb';

@injectable()
class SiscofDbDev implements SiscofDb {
  constants: any;

  constructor(
    constants: any,
  ) {
    this.constants = constants;
  }
  connectByPool = () => {
    const obj = {
      execute: (query, params) => {
        console.log('SISCOF-DB: execute', query.replace(/\s/g, ''));
        console.log('SISCOF-DB: params', params);
        return Promise.resolve({
          outBinds: {
            nrtc: 0,
            wrtc: 0,
            wmsg: '',
          },
        });
      },
      close: () => Promise.resolve(),
    };
    return Promise.resolve(obj);
  }
}

export default SiscofDbDev;
