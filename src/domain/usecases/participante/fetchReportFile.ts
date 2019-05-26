import fetchReportFile from '../../services/file/fetchReportFile';
import { Sequelize } from 'sequelize-database';

const fetchFile = (db: Sequelize, fileStorage) => {
  const fetch = fetchReportFile(fileStorage);

  return (reportId: number) => fetch(reportId, db.entities.participanteDomicilioBancario);
};

export default fetchFile;
