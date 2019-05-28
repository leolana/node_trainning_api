import Auth from '../../../infra/auth/Auth';
import { healthCheckServicesEnum } from '.';

const testKeyCloakAccessUseCase = (auth: Auth) => async () => {
  try {
    await auth.authenticateAsAdmin();
    return '';
  } catch (err) {
    return {
      serviceStatus: healthCheckServicesEnum.keyCloak,
      message: 'Failed to connect to KeyCloak'
    };
  }
};

export default testKeyCloakAccessUseCase;
