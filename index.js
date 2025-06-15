const express = require('express');
const bodyParser = require('body-parser');
const webhookQueue = require('./queue/WebhookQueue.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/webhook/github', async (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;
    await webhookQueue.add({ event, payload });
    res.status(200).send("✅ Webhook received and queued.");
});

app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`);
});
