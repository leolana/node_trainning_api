import dataFaker from '../../dataFaker';

const usuarioFactory = (factory) => {
  return factory.define('usuario', {
    id: '00000000-0000-0000-0000-000000000000',
    nome: dataFaker.name(),
    email: dataFaker.email(),
    documento: dataFaker.cpf(),
    username: dataFaker.name({ length: 50 }),
    celular: dataFaker.phone(),
    roles: ['USUARIO-TI'],
    ativo: dataFaker.bool(),
    associacoes: [
      {
        participanteId: 1,
      }
    ]
  });
};

export default usuarioFactory;
