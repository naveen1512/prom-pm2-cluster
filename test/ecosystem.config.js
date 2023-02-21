module.exports = {
	apps: [
		{
			name: 'Metric-Server',
			instances: 1,
			exec_mode: 'fork',
			script: './lib/metric.server.js'
		},
		{
			name: 'My-App',
			instances: 2,
			exec_mode: 'cluster',
			script: './test/my.app.js'
		}
	]
};
