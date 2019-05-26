import mutateService from '../../services/credenciamento/mutateService';
import deformatDocument from '../../services/credenciamento/deformatDocument';
import credenciamentoStatusEnum from '../../entities/credenciamentoStatusEnum';

const add = (db, fileStorage) => (
  data,
  files,
  documento,
  user
) => {
  const document = deformatDocument(documento);

  const mutateCredenciamento = mutateService(db, fileStorage);

  return mutateCredenciamento(data, credenciamentoStatusEnum.pendente, files, document, user);
};

export default add;
