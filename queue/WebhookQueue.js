const Queue = require('bull');
require('dotenv').config();

module.exports = new Queue('triggerMail', process.env.REDIS_URL);