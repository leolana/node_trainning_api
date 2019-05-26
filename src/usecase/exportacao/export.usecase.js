const { DateTime } = require('luxon');

const reports = require('../../service/exportacao/reports.enum');

/* eslint-disable max-len */
const salesStatement = require('../../service/exportacao/salesStatement.service');
const salesRegistryDetail = require('../../service/exportacao/salesRegistryDetail.service');
const salesRegistrySummary = require('../../service/exportacao/salesRegistrySummary.service');
const payments = require('../../service/exportacao/payments.service');
const tariffAdjustments = require('../../service/exportacao/tariffAdjustments.service');
const financial = require('../../service/exportacao/financial.service');
/* eslint-enable max-len */

module.exports = (
  db,
  siscofWrapper
) => (reportId, participantId, startDate, endDate) => {
  const prevalidation = (startDate, endDate) => {
    if (!startDate) {
      return Promise.reject(String('data-inicio-nao-especificada'));
    }

    if (!endDate) {
      return Promise.reject(String('data-fim-nao-especificada'));
    }

    return Promise.resolve();
  };

  const find = (reportId, participantId) => db.entities.exportacao
    .findOne({
      attributes: ['id', 'arquivo'],
      where: {
        id: reportId,
      },
      include: [
        {
          model: db.entities.participanteExportacao,
          as: 'participante',
          attributes: [],
          where: {
            participanteId: participantId,
          },
          required: true,
        },
      ],
    });

  const getData = (report, participantId, startDate, endDate) => {
    if (!report) throw String('exportacao-indisponivel');

    let service = null;

    switch (report.id) {
    case reports.salesStatement:
      service = salesStatement(siscofWrapper);
      break;
    case reports.salesRegistryDetail:
      service = salesRegistryDetail(siscofWrapper);
      break;
    case reports.salesRegistrySummary:
      service = salesRegistrySummary(siscofWrapper);
      break;
    case reports.payments:
      service = payments(siscofWrapper);
      break;
    case reports.tariffAdjustments:
      service = tariffAdjustments(siscofWrapper);
      break;
    case reports.financial:
      service = financial(siscofWrapper);
      break;
    default:
      break;
    }

    if (service == null) throw String('exportacao-indisponivel');

    return service(participantId, startDate, endDate);
  };

  const buildCsv = (report, data, startDate, endDate) => {
    let filename = report.arquivo;

    filename = filename.replace(
      '{date}',
      `${DateTime.fromJSDate(startDate).toFormat('yyyyMMdd')}`
        + `_${DateTime.fromJSDate(endDate).toFormat('yyyyMMdd')}`
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
