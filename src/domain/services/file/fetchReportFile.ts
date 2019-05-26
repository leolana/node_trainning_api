import { Model } from 'sequelize';

const fetchFile = (fileStorage) => {
  const findEntity = (model: Model<any, any>, reportId: number, options: any) => model
    .findOne({
      where: { id: reportId, ...(options || {}) },
      attributes: ['arquivo'],
    });

  const findFile = (data) => {
    if (!data) throw new Error('not-exists');

    const file = data.arquivo;

    if (!file) throw new Error('file-not-exists');

    return file;
  };

  return async (
    reportId: number,
    model: Model<any, any>,
    options: any = null
  ) => {
    const data = await findEntity(model, reportId, options);
    const filename = findFile(data);
    const file = await fileStorage.download(`${filename}`);

    return {
      ...file,
      filename
    };
  };
};

export default fetchFile;
