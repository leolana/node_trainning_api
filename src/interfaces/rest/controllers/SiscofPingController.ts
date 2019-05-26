// tslint:disable:no-magic-numbers
import { Router, Response, NextFunction } from 'express';
import { Request } from 'express-request';
import { injectable, inject } from 'inversify';

import Controller from '../Controller';
import { SiscofConnector, SiscofDb } from '../../../infra/siscof';
import { LoggerInterface } from '../../../infra/logging/LoggerInterface';

import types from '../../../constants/types';

@injectable()
class SiscofPingController implements Controller {
  db: SiscofDb;
  siscofConnector: SiscofConnector;
  logger: LoggerInterface;

  constructor(
    @inject(types.SiscofDb) db: SiscofDb,
    @inject(types.SiscofConnectorFactory) siscofConnector: () => SiscofConnector,
    @inject(types.Logger) logger: LoggerInterface,
  ) {
    this.db = db;
    this.siscofConnector = siscofConnector();
    this.logger = logger;
  }

  get router(): Router {
    const router = Router();

    router.get('/siscofPing', this.ping);
    router.get('/siscofDate', this.date);

    return router;
  }

  ping = async (req: Request, res: Response, next: NextFunction) => {
    return this.siscofConnector.executeCommand(
      `SELECT PARAMETER, VALUE FROM nls_session_parameters
      UNION
      SELECT PARAMETER, VALUE FROM v$nls_parameters
      WHERE PARAMETER IN ('NLS_LANGUAGE', 'NLS_CHARACTERSET')
      ORDER BY 1`
      ,
      []
    )
      .then(result => res.send(result.rows))
      .catch(next);
  }

  date = async (req: Request, res: Response, next: NextFunction) => {
    const datesArray = [
      { strDate: 'new Date()', dateIn: new Date() },
      { strDate: 'new Date(\'2019-01-01\')', dateIn: new Date('2019-01-01') },
      { strDate: 'new Date (2019, 0, 1)', dateIn: new Date(2019, 0, 1) },
      { strDate: 'new Date(2019,0,1,0,0,0,0)', dateIn: new Date(2019, 0, 1, 0, 0, 0, 0) },
      { strDate: 'new Date(2019,0,1,0,0,0,0) TZ', dateIn: new Date(Date.UTC(2019, 0, 1, 0, 0, 0, 0)) },
      // {strDate: 'new Date(2019,0,1,0,0,0,0) GMT', dateIn: new Date('2019-01-01 00:00:00 BRT') },
      { strDate: 'String', dateIn: new Date('2019-01-01T00:00:00.0') },
    ];
    const promises = [];
    const output = [];
    // promises.push(
    datesArray.forEach((date) => {
      const params = {
        dataIn: date.dateIn,
        dataOut: { dir: this.db.constants.BIND_OUT, type: this.db.constants.STRING }
      };
      promises.push(
        this.siscofConnector.executeCommand(
          // execute immediate 'alter session set time_zone=''America/Sao_Paulo'''; \
          `BEGIN
              ITLAB.TESTE_DATE(:dataIn, :dataOut);
          END;`,
          params
        )
          .then((result) => {
            output.push({
              dataStr: date.strDate,
              dataIn: `${date.dateIn.toString()} - ${date.dateIn.toUTCString()}`,
              dataOut: result.outBinds.dataOut
            });
          })
          .catch(error => this.logger.error(error))
      );
    });
    // );

    return Promise.all(promises)
      .then(() =>
        res.send(output)
      )
      .catch(next);
  }
}

export default SiscofPingController;
