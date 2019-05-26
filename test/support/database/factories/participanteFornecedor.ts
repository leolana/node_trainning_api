import dataFaker from '../../dataFaker';

const participanteFornecedorFactory = (factory) => {
  return factory.define('participanteFornecedor', {
    participanteId: dataFaker.integer(),
    participante: {
      id: 4,
      integracoes: [],
      documento: '00000000000000',
      nome: 'Roberto Silva',
      createdAt: '2019-03-06T00:00:00.000-03:00',
      ativo: true,
      numero: '145',
    },
  });
};

export default participanteFornecedorFactory;
