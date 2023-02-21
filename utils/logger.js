const pino = require('pino');

const levels = {
	http: 10,
	debug: 20,
	info: 30,
	warn: 40,
	error: 50,
	fatal: 60
};

module.exports = pino({
	customLevels: levels,
	useOnlyCustomLevels: true,
	level: 'debug'
});
