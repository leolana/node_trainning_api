const { DateTime } = require('luxon');

const tiposParticipante = require('../service/participante/type.enum');

const usecases = require('../usecase/exportacao');

const controller = (db, siscofWrapper) => {
  const reports = usecases(db, siscofWrapper);

  const check = (req, res) => reports
    .verify(+req.user.participante)
    .then(result => res.send({ habilitado: Boolean(result) }))
    .catch(err => res.catch(err));

  const list = (req, res) => reports
    .search(+req.user.participante)
    .then(result => res.send(result))
    .catch(err => res.catch(err));

  const get = (req, res) => {
    const reportId = +req.params.id;
    const participantId = +req.user.participante;

    const startDate = DateTime.fromISO(req.query.dataOperacaoInicial).toJSDate();
    const endDate = DateTime.fromISO(req.query.dataOperacaoFinal).toJSDate();

    return reports
      .export(reportId, participantId, startDate, endDate)
      .then((ret) => {
        res.set({
          'Access-Control-Expose-Headers': 'Content-Disposition',
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=${ret.filename}`,
        });

        res.write(ret.data);
        return res.end();
      })
      .catch(err => res.catch(err));
  };

  return Promise.resolve({
    check,
    list,
    get,
  });
};

module.exports = (di) => {
  di.provide(
    '#reports',
    '$main-db',
    '$siscof-wrapper',
    controller
  ).init(
    '#reports',
    '$server',
    '$auth',
    (controller, server, auth) => {
      const allow = auth.requireParticipante(
        tiposParticipante.estabelecimento,
        tiposParticipante.fornecedor,
      );

      server.get(
        '/exportacao/verificacao',
        controller.check,
      );

      server.get(
        '/exportacao',
        allow,
        controller.list,
      );

      server.get(
        '/exportacao/:id',
        allow,
        controller.get,
      );
    }
  );
};
