import dataFaker from '../../dataFaker';

const participanteContatoFactory = (factory) => {
  return factory.define('participanteContato', {
    participanteId: dataFaker.integer(),
    nome: dataFaker.name(),
    email: dataFaker.email(),
    telefone: dataFaker.string({ length: 10, pool: '0123456789' }),
    celular: dataFaker.string({ length: 11, pool: '0123456789' }),
    ativo: dataFaker.bool({ likelihood: 100 }),
  });
};

export default participanteContatoFactory;
