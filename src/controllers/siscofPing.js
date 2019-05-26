const { DateTime } = require('luxon');
module.exports = di => {
    di
        .provide('#siscofPing', '$siscof-connector', '$siscof-db', (siscofConnector, db) => {
            return Promise.resolve({
                ping: (req, res) => {
                    siscofConnector.executeCommand(
                        "SELECT PARAMETER, VALUE FROM nls_session_parameters \
                        UNION \
                        SELECT PARAMETER, VALUE FROM v$nls_parameters \
                        WHERE PARAMETER IN ('NLS_LANGUAGE', 'NLS_CHARACTERSET') \
                        ORDER BY 1"
                        ,[])
                    .then(result =>
                        res.send(result.rows))
                    .catch(error => res.catch(error));
                },
                date: (req, res) => {
                    datesArray = [
                        {strDate: 'new Date()',                 dateIn: new Date() },
                        {strDate: 'new Date(\'2019-01-01\')',   dateIn: new Date('2019-01-01') },
                        {strDate: 'new Date (2019, 0, 1)', dateIn: new Date (2019, 0, 1) },
                        {strDate: 'new Date(2019,0,1,0,0,0,0)', dateIn: new Date(2019,0,1,0,0,0,0) },
                        {strDate: 'new Date(2019,0,1,0,0,0,0) TZ', dateIn: new Date(Date.UTC(2019,0,1,0,0,0,0))},
                        //{strDate: 'new Date(2019,0,1,0,0,0,0) GMT', dateIn: new Date('2019-01-01 00:00:00 BRT')},
                        {strDate: 'String', dateIn: new Date('2019-01-01T00:00:00.0')},
                    ];
                    let promises = [];
                    let output = [];
                    //promises.push(
                    datesArray.forEach(date => {
                        const params = {
                            dataIn : date.dateIn,
                            dataOut: { dir: db.constants.BIND_OUT, type: db.constants.STRING }
                        };
                        promises.push(
                            siscofConnector.executeCommand(
//                                    execute immediate 'alter session set time_zone=''America/Sao_Paulo'''; \
                                "BEGIN \
                                    ITLAB.TESTE_DATE(:dataIn, :dataOut); \
                                 END;"
                                ,params)
                            .then(result => {
                                output.push({
                                    dataStr: date.strDate,
                                    dataIn : date.dateIn.toString() + " - " + date.dateIn.toUTCString(),
                                    dataOut: result.outBinds.dataOut
                                })
                            })
                            .catch(error => console.log(error))
                        );

                    });
                    //);

                    Promise.all(promises)
                    .then(() =>
                        res.send(output)
                    )
                    .catch(error => res.catch(error))
                },
            });
        })
        .init('#siscofPing', '$server', (controller, server) => {
            server.get('/siscofPing', controller.ping);
            server.get('/siscofDate', controller.date);
        });
};
