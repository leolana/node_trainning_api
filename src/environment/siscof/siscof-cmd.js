let printLog = true;

module.exports = di => {
    di.provide('$siscof-cmd', '$siscof-db', (db) => Promise.resolve({
        executeCommand: (query, params, name) => {
            const deniedWords = ['DELETE', 'UPDATE', 'INSERT', 'DROP', 'GRANT',
            'CREATE', 'ALTER', 'TABLE', 'TRUNCATE']
            if (new RegExp(deniedWords.join("|")).test(query.toUpperCase())) {
                log(['QUERY COM PALAVA RESERVADA', query, params]);
                return null
            }

            log([name + '.input=', query, params]);
            return db
            .connectByPool()
            .then(connection => {
                log(name + '.before-execute');
                return connection
                    .execute(query, params)
                    .then(result => {
                        log(name +'.output-close-connection=', result);
                        connection.close();
                        log(name +'.output=', result);
                        return result;
                    })
                    //Em testes quando deu erro não estava liberando as conexões sem esse catch
                    .catch((err) => {
                        log('.catch=', err);
                        connection.close();
                        throw err;
                    });
            })
        },
    }))
}

function log(name, log) {
    if (printLog)
        console.log(name, log);
}