const { clients } = require("./chstWsStore");

function broadcast(payload) {
	const message = JSON.stringify(payload);
	for (const [, clientWs] of clients) {
		if (clientWs.readyState === clientWs.OPEN) {
			try {
				clientWs.send(message);
			} catch (e) {
				logEvent('error', null, 'WS send err', e.message);
			}
		}
	}
}

function sendToClient(userId, payload) {
	const clientWs = clients.get(userId);

	if (clientWs && clientWs.readyState === clientWs.OPEN) {
		try {
			clientWs.send(JSON.stringify(payload));
			return true;
		} catch (e) {
			logEvent('error', userId, 'WS send err', e.message);
		}
	}
	return false;
  }

function logEvent(level, userId, event, details = '') {
	const prefix = userId ? `[User ${userId}]` : '';
	const message = `${event} ${details}`.trim();

	if (level === 'info') {
		fastify.log.info(`${prefix} ${message}`);
	} else if (level === 'warn') {
		fastify.log.warn(`${prefix} ${message}`);
	} else {
		fastify.log.error(`${prefix} ${message}`);
	}
}

module.exports = {
	broadcast,
	logEvent,
	sendToClient
}