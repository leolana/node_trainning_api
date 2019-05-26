// tslint:disable:no-implicit-dependencies
// tslint:disable:function-name
// tslint:disable:no-namespace

import * as core from 'express-serve-static-core';

declare function e(): core.Express;

declare namespace e {

    interface Request extends core.Request {
      user?: any;
      files: any;
    }
}

export = e;
