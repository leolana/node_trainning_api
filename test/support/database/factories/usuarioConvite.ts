import dataFaker from '../../dataFaker';
import { DateTime } from 'luxon';

const usuarioConviteFactory = (factory) => {
  return factory.define('usuarioConvite', {
    codigo: '00000000-0000-0000-0000-000000000000',
    nome: dataFaker.name(),
    email: 'mail@mail',
    celular: dataFaker.phone(),
    roles: ['USUARIO-TI'],
    convidadoPor: dataFaker.name(),
    participante: dataFaker.integer(),
    expiraEm: DateTime.local().plus({ day: 1 }).toSQLDate()
  });
};

export default usuarioConviteFactory;
