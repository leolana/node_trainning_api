import { DateTime } from 'luxon';

import reportsEnum from '../../services/exportacao/reportsEnum';
import salesStatement from '../../services/exportacao/salesStatement';
import salesRegistryDetail from '../../services/exportacao/salesRegistryDetail';
import salesRegistrySummary from '../../services/exportacao/salesRegistrySummary';
import payments from '../../services/exportacao/payments';
import tariffAdjustments from '../../services/exportacao/tariffAdjustments';
import financial from '../../services/exportacao/financial';

const exportUseCase = (
  db,
  siscofWrapper
) => (reportId, participantId, startDate, endDate) => {
  const prevalidation = (start, end) => {
    if (!start) {
      return Promise.reject(String('data-inicio-nao-especificada'));
    }

    if (!end) {
      return Promise.reject(String('data-fim-nao-especificada'));
    }

    return Promise.resolve();
  };

  const find = (report, participante) => db.entities.exportacao
    .findOne({
      attributes: ['id', 'arquivo'],
      where: {
        id: report,
      },
      include: [
        {
          model: db.entities.participanteExportacao,
          as: 'participante',
          attributes: [],
          where: {
            participanteId: participante,
          },
          required: true,
        },
      ],
    });

  const getData = (report, participante, start, end) => {
    if (!report) throw new Error('exportacao-indisponivel');

    let service = null;

    switch (report.id) {
      case reportsEnum.salesStatement:
        service = salesStatement(siscofWrapper);
        break;
      case reportsEnum.salesRegistryDetail:
        service = salesRegistryDetail(siscofWrapper);
        break;
      case reportsEnum.salesRegistrySummary:
        service = salesRegistrySummary(siscofWrapper);
        break;
      case reportsEnum.payments:
        service = payments(siscofWrapper);
        break;
      case reportsEnum.tariffAdjustments:
        service = tariffAdjustments(siscofWrapper);
        break;
      case reportsEnum.financial:
        service = financial(siscofWrapper);
        break;
      default:
        break;
    }

    if (service == null) throw new Error('exportacao-indisponivel');

    return service(participante, start, end);
  };

  const buildCsv = (report, data, start, end) => {
    let filename = report.arquivo;

    filename = filename.replace(
      '{date}',
      `${DateTime.fromJSDate(start).toFormat('yyyyMMdd')}`
        + `_${DateTime.fromJSDate(end).toFormat('yyyyMMdd')}`
    );

    return {
      filename,
      data,
    };
  };

  return prevalidation(startDate, endDate)
    .then(() => find(reportId, participantId))
    .then(report => getData(report, participantId, startDate, endDate)
      .then(data => buildCsv(report, data, startDate, endDate)));
};

export default exportUseCase;
