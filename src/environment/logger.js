let winston = require('winston');
let Transport = require('winston-transport');

module.exports = di => {
	di.provide('$logger', '@log-settings', (settings) => new Promise((resolve, reject) => {
		let levels = winston.config.npm.levels;
		let errLevel = settings.stderrLevel;
		let outLevel = settings.stdoutLevel;

		let _stderrLevels = [];
		for (let i in levels)
			if (levels[i] <= levels[errLevel])
				_stderrLevels.push(i);

		let _transports = [new winston.transports.Console({
			level: outLevel,
			stderrLevels: _stderrLevels,
			handleExceptions: true
		})];

		let logger = winston.createLogger({
			exitOnError: false,
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json()
			),
			transports: _transports
		});

		resolve(logger);
	}));
}
