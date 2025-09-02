
module.exports = async function chatWebSocketRoute(fastify) {
  fastify.get('/game', { websocket: true }, (ws, request) => {
		const url = request.raw.url;
		fastify.log.info('🌐 New WS connection request: ' + url);
		const route = url.split('?')[0];
		const remoteAddress = request.socket.remoteAddress;
		fastify.log.info('🟢 Game connected from ' + remoteAddress);
		ws.on('message', (msg) => {
		  fastify.log.info(`📩 Message from client: ${msg.toString()}`);
		  ws.send(`Server echo: ${msg.toString()}`);
		});
		ws.on('close', (code, reason) => {
		  fastify.log.info('❌ WS disconnected, code: ' + code + ' reason: ' + (reason?.toString() || ''));
		});
		ws.on('error', (err) => {
		  fastify.log.error(`⚠️ WS error: ${err.message}`);
		});
  });
};
