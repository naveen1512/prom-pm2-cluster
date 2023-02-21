require('../lib/metric.worker');

const logger = require('../utils/logger');
const promClient = require('prom-client');
const app = require('express')();
const port = 3000;

const histogram = new promClient.Histogram({
	name: 'http_requests_duration_seconds',
	help: 'Duration of HTTP requests in seconds.',
	labelNames: ['method', 'status_code', 'exception', 'uri'],
	buckets: [0.1, 0.2, 0.3, 0.4, 0.5]
});

app.get('/myapp', (req, res) => {
	logger.debug('Received request - GET /myapp');
	const endTimer = histogram.startTimer();

	res.send('Success.');

	logger.debug('Sent response - GET /myapp');
	endTimer({
		method: 'GET',
		status_code: '200',
		exception: '',
		uri: '/myapp'
	});
});

app.listen(port, () => {
	logger.debug('My App is running on port - ' + port);
});
