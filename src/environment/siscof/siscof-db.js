let oracledb = require('oracledb');

let enablePoolStats = false;
let printLog = true;

module.exports = di => {
    di.provide('$siscof-db', '@siscof-settings', (settings) => {
        let pool = oracledb.createPool({
            poolAlias       : 'siscof',
            user            : settings.user,
            password        : settings.password,
            connectString   : settings.connectString,
            _enableStats    : enablePoolStats,
            poolIncrement   : 1,
            poolMin         : 0,
            poolMax         : 4,
            poolPingInterval: 60,
            poolTimeout     : 60,
            queueRequests   : true,
            queueTimeout    : 60000
        })

        let constants = {};

        // Encapsular todas as constantes para fora do objeto oracle
        for (prop in oracledb) {
            if (typeof(oracledb[prop]) === 'number' || typeof(oracledb[prop]) === 'string') {
                constants[prop] = oracledb[prop];
            }
        }

        return Promise.resolve({
            constants: constants,
            connectByPool: () => {
                return pool
                    .then (pooled => {
                        log('.connect-by-pool');
                        if (enablePoolStats) pooled._logStats();
                        return pooled.getConnection();
                    })
            }
        })
    })
}

function log(name, log) {
    if (printLog)
        console.log(name, log);
}