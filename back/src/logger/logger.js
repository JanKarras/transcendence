const pino = require('pino');
const multistream = require('pino-multi-stream').multistream;
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir);
}

const streams = [
	{ level: 'error', stream: fs.createWriteStream(path.join(logDir, 'error.log'), { flags: 'a' }) },
	{ level: 'info', stream: fs.createWriteStream(path.join(logDir, 'info.log'), { flags: 'a' }) },
	{ level: 'debug', stream: fs.createWriteStream(path.join(logDir, 'debug.log'), { flags: 'a' }) },
	{ level: 'debug', stream: process.stdout }
];

const logger = pino({
	level: 'debug',
}, multistream(streams));

module.exports = logger;
