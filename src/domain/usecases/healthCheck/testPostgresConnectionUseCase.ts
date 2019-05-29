import { Sequelize } from 'sequelize-typescript';
import { healthCheckServicesEnum } from '.';

const testPostgresConnectionUseCase = (db: Sequelize) => async () => {
  try {
    await db.query('SELECT 1;');
    return '';
  } catch (err) {
    return {
      serviceStatus: healthCheckServicesEnum.postgres,
      message: 'Failed to connect to Postgress'
    };
  }
};

export default testPostgresConnectionUseCase;
