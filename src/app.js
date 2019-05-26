let Maestro = require('maestro-io');
let di = new Maestro(__dirname);

di
    .loadDirs('environment', 'controllers', 'model', 'services', 'environment/siscof', 'environment/mailer')
    .init('$main-db', '$logger', '@db-settings', (mainDb, logger, settings) => {
    })
    .start()
    .catch(console.log);
