import dataFaker from '../../dataFaker';

const usuarioFactory = (factory) => {
  return factory.define('usuario', {
    id: '00000000-0000-0000-0000-000000000000',
    nome: dataFaker.name(),
    email: dataFaker.email(),
    celular: dataFaker.phone(),
    roles: ['USUARIO-TI'],
    ativo: dataFaker.bool(),
  });
};

export default usuarioFactory;
