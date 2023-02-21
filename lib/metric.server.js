const pm2 = require('pm2');
const promClient = require('prom-client');
const metricsServer = require('express')();
const logger = require('../utils/logger');

const metricServerPort = process.env.METRIC_SERVER_PORT || 3001;
const metrics = {};

metricsServer.get('/metrics', (req, res) => {
	try {
		logger.debug('Received /metrics req.');

		const aggregatedRegistry = promClient.AggregatorRegistry.aggregate(
			Object.values(metrics).map((o) => o)
		);

		res.set('Content-Type', aggregatedRegistry.contentType);

		aggregatedRegistry.metrics().then((aggregatedMetrics) => {
			res.write(aggregatedMetrics);
			res.end();
		});

		logger.debug('Sent /metrics res.');
	} catch (e) {
		logger.error({ error: e }, 'Error: /metrics.');
	}
});

metricsServer.listen(metricServerPort, '0.0.0.0', () => {
	process.send('ready');

	logger.debug('Metrics server listening on 0.0.0.0:%d', metricServerPort);
});

process.on('message', (msg) => {
	if (msg.from !== process.env.pm_id && msg.topic === 'metrics') {
		metrics[msg.from] = msg.data;
		logger.debug('Received msg from %s on topic %s', msg.from, msg.topic);
	}
});

process.on('SIGINT', () => {
	logger.debug('Received SIGINT signal.');

	pm2.disconnect(() => {});
});
