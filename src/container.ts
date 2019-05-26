import { Container, interfaces } from 'inversify';
import { Sequelize } from 'sequelize-database';

import { DatabaseFactory } from './infra/database';
import Application from './Application';
import { LoggerInterface, LoggerFactory } from './infra/logging';
import Server from './infra/api/Server';

import {
  SiscofCmd,
  SiscofDb,
  SiscofConnector,
  SiscofConnectorDev,
  SiscofConnectorProd,
  SiscofDbBootstrapper,
  SiscofFormatter,
  SiscofWrapper
} from './infra/siscof';

import { Mailer, MailerAWS, MailerDev, MailerFactory } from './infra/mailer';
import { Auth, AuthDev, AuthProd, AuthFactory } from './infra/auth';
import { FileStorage, FileStorageAWS, FileStorageDev, FileStorageFactory } from './infra/fileStorage';
import { InternalApis, InternalApisDev, InternalApisProd } from './infra/internalApis';
import EnvironmentFactory from './infra/environment/EnvironmentFactory';
import { PersonAPI, PersonAPIDev, PersonAPIProd } from './infra/movidesk';
import { Environment } from './infra/environment/Environment';

import CessionService from './domain/services/CessionService';
import VinculoService from './domain/services/VinculoService';

import types from './constants/types';
import InternalApisFactory from './infra/internalApis/InternalApisFactory';
import PersonAPIFactory from './infra/movidesk/PersonAPIFactory';
import SiscofConnectorFactory from './infra/siscof/SiscofConnectorFactory';

const container = new Container();

container.bind<Sequelize>(types.Database).toDynamicValue((context: interfaces.Context) => {
  const factory = new DatabaseFactory(context);

  return factory.create();
}).inRequestScope();
container.bind<LoggerInterface>(types.Logger).toDynamicValue((context: interfaces.Context) => {
  const factory = new LoggerFactory(context);

  return factory.create();
}).inSingletonScope();
container.bind<Application>(types.Application).to(Application);
container.bind<Server>(types.Server).to(Server);

container.bind<MailerDev>(types.MailerDev).to(MailerDev);
container.bind<MailerAWS>(types.MailerAWS).to(MailerAWS);
container.bind<interfaces.Factory<Mailer>>(types.MailerFactory).toFactory<Mailer>((context: interfaces.Context) => {
  return () => {
    const factory = new MailerFactory(context);

    return factory.create();
  };
});

container.bind<AuthDev>(types.AuthDev).to(AuthDev);
container.bind<AuthProd>(types.AuthProd).to(AuthProd);
container.bind<interfaces.Factory<Auth>>(types.AuthFactory).toFactory<Auth>((context: interfaces.Context) => {
  return () => {
    const factory = new AuthFactory(context);

    return factory.create();
  };
});

container.bind<FileStorageDev>(types.FileStorageDev).to(FileStorageDev);
container.bind<FileStorageAWS>(types.FileStorageAWS).to(FileStorageAWS);
container
  .bind<interfaces.Factory<FileStorage>>(types.FileStorageFactory)
  .toFactory<FileStorage>((context: interfaces.Context) => {
    return () => {
      const factory = new FileStorageFactory(context);

      return factory.create();
    };
  });

container.bind<Environment>(types.Environment).toDynamicValue(() => {
  const factory = new EnvironmentFactory();

  return factory.create();
}).inSingletonScope();

container.bind<InternalApisDev>(types.InternalApisDev).to(InternalApisDev);
container.bind<InternalApisProd>(types.InternalApisProd).to(InternalApisProd);
container
  .bind<interfaces.Factory<InternalApis>>(types.InternalApisFactory)
  .toFactory<InternalApis>((context: interfaces.Context) => {
    return () => {
      const factory = new InternalApisFactory(context);

      return factory.create();
    };
  });

container.bind<PersonAPIDev>(types.PersonAPIDev).to(PersonAPIDev);
container.bind<PersonAPIProd>(types.PersonAPIProd).to(PersonAPIProd);
container
  .bind<interfaces.Factory<PersonAPI>>(types.PersonAPIFactory)
  .toFactory<PersonAPI>((context: interfaces.Context) => {
    return () => {
      const factory = new PersonAPIFactory(context);

      return factory.create();
    };
  });

container.bind<SiscofCmd>(types.SiscofCmd).to(SiscofCmd);
container.bind<SiscofDb>(types.SiscofDb).toDynamicValue((context: interfaces.Context) => {
  const siscofDbBootstrapper = new SiscofDbBootstrapper(context);
  return siscofDbBootstrapper.create();
}).inSingletonScope();

container.bind<SiscofConnectorDev>(types.SiscofConnectorDev).to(SiscofConnectorDev);
container.bind<SiscofConnectorProd>(types.SiscofConnectorProd).to(SiscofConnectorProd);
container
  .bind<interfaces.Factory<SiscofConnector>>(types.SiscofConnectorFactory)
  .toFactory<SiscofConnector>((context: interfaces.Context) => {
    return () => {
      const factory = new SiscofConnectorFactory(context);

      return factory.create();
    };
  });

container.bind<SiscofFormatter>(types.SiscofFormatter).to(SiscofFormatter);
container.bind<SiscofWrapper>(types.SiscofWrapper).to(SiscofWrapper);

container.bind<CessionService>(types.CessionService).to(CessionService);
container.bind<VinculoService>(types.VinculoService).to(VinculoService);

export default container;
