const webhookQueue = require('./queue/WebhookQueue');
const webhookJob = require('./jobs/webhookJob');

webhookQueue.process(webhookJob);

console.log("✅ Webhook processor is running...");
