import dataFaker from '../../dataFaker';

const usuarioConviteFactory = (factory) => {
  return factory.define('usuarioConvite', {
    codigo: '00000000-0000-0000-0000-000000000000',
    nome: dataFaker.name(),
    email: dataFaker.email(),
    celular: dataFaker.phone(),
    roles: ['USUARIO-TI'],
    convidadoPor: dataFaker.name(),
    participante: dataFaker.integer(),
    expiraEm: dataFaker.date()
  });
};

export default usuarioConviteFactory;
