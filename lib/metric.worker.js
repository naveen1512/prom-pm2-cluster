const promClient = require('prom-client');
const pm2 = require('pm2');
const logger = require('../utils/logger');

const metricsSentInterval = process.env.METRICS_SENT_INTERVAL || 5000;

setInterval(() => {
	pm2.connect(() => {
		pm2.describe('Metric-Server', (err, metricServerDetails) => {
			metricServerDetails.forEach((processDetails) => {
				promClient.register.getMetricsAsJSON().then((jsonMetrics) => {
					pm2.sendDataToProcessId(
						processDetails.pm_id,
						{
							from: process.env.pm_id,
							data: jsonMetrics,
							topic: 'metrics'
						},
						(error) => {
							if (error) {
								logger.error(
									{ error },
									'Error while sending the metrics to %s from %s.',
									processDetails.pm_id,
									process.env.pm_id
								);
							} else {
								logger.debug(
									'Sent metrics to %s from %s',
									processDetails.pm_id,
									process.env.pm_id
								);
							}
						}
					);
				});
			});
		});
	});
}, metricsSentInterval);

process.on('SIGINT', () => {
	logger.info('Received SIGINT signal.');

	pm2.disconnect(() => {});
});
