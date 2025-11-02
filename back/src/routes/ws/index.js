const authMiddleware = require('../../middleware/auth');

module.exports = async function (fastify) {
	fastify.get(
		'/webSocketGame',
		{ websocket: true },
		(socket, req) => {
			fastify.log.info('🟢 WebSocket handler triggered');
			fastify.log.info(`🔌 WebSocket connected from ${req.ip} → ${req.url}`);
			const url = require('url');
			const token = url.parse(req.url, true).query.token;
			fastify.log.info(`Token from query: ${token}`);

		  const interval = setInterval(() => {
			if (socket.readyState === 1) socket.ping();
		  }, 10000);
		  socket.on('message', (message) => {

			const msg = message.toString();
			fastify.log.info(`📩 Message from client: ${msg}`);

			socket.send('hi from server');
			fastify.log.info(`📤 Sent reply: hi from server`);
		  });

		  socket.on('close', () => {
			clearInterval(interval);
			fastify.log.info(`❌ WebSocket disconnected: ${req.ip}`);
		  });

		  socket.on('error', (err) => {
			clearInterval(interval);
			fastify.log.error(`⚠️ WebSocket error: ${err.message}`);
		  });
		}
	);
};
