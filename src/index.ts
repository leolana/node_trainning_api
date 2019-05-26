import types from './constants/types';
import container from './container';
import Application from './Application';

const app = container.get<Application>(types.Application);

app
  .start()
  .catch((error) => {
    app.logger.error(error);
    process.exit();
  });
