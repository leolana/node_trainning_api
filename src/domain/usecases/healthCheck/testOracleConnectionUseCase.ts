import { SiscofConnector } from '../../../infra/siscof';
import { healthCheckServicesEnum } from '.';

const testOracleConnection = (siscof: SiscofConnector) => async () => {
  try {
    await siscof
      .executeCommand(
        `SELECT PARAMETER, VALUE FROM nls_session_parameters
      UNION
      SELECT PARAMETER, VALUE FROM v$nls_parameters
      WHERE PARAMETER IN ('NLS_LANGUAGE', 'NLS_CHARACTERSET')
      ORDER BY 1`,
        []
      );
    return '';
  } catch (err) {
    return {
      serviceStatus: healthCheckServicesEnum.oracle,
      message: 'Failed to connet to Siscof'
    };
  }
};

export default testOracleConnection;
