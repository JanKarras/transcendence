require('dotenv').config();
const logger = require('../logger/logger');
const Fastify = require('fastify');
const fastifyCookie = require('@fastify/cookie');
const multipart = require('@fastify/multipart');
const fastifyWebsocket = require('@fastify/websocket');
const wsGame = require('../websocket/game');
const wsChat = require('../websocket/ws');
const fastify = Fastify({ logger: { level: 'info' } });

fastify.register(fastifyWebsocket);
fastify.register(multipart);
fastify.register(fastifyCookie, {
	secret: process.env.JWT_SECRET,
	parseOptions: {}
});

fastify.register(require('../routes/getters/'), { prefix: '/api/get' });
fastify.register(require('../routes/setters/'), { prefix: '/api/set' });

// const startWebSocket = async () => {


//   fastify.get('/chat', { websocket: true }, (ws, request) => {
// 		const url = request.raw.url;
// 		fastify.log.info('🌐 New WS connection request: ' + url);
// 		const route = url.split('?')[0];
// 		const remoteAddress = request.socket.remoteAddress;
// 		fastify.log.info('🟢 Chat connected from ' + remoteAddress);
// 		ws.on('message', (msg) => {
// 		  fastify.log.info(`📩 Message from client: ${msg.toString()}`);
// 		  ws.send(`Server echo: ${msg.toString()}`);
// 		});
// 		ws.on('close', (code, reason) => {
// 		  fastify.log.info('❌ WS disconnected, code: ' + code + ' reason: ' + (reason?.toString() || ''));
// 		});
// 		ws.on('error', (err) => {
// 		  fastify.log.error(`⚠️ WS error: ${err.message}`);
// 		});
// 	});

// 	  fastify.get('/game', { websocket: true }, (ws, request) => {
// 		const url = request.raw.url;
// 		fastify.log.info('🌐 New WS connection request: ' + url);
// 		const route = url.split('?')[0];
// 		const remoteAddress = request.socket.remoteAddress;
// 		fastify.log.info('🟢 Game connected from ' + remoteAddress);
// 		ws.on('message', (msg) => {
// 		  fastify.log.info(`📩 Message from client: ${msg.toString()}`);
// 		  ws.send(`Server echo: ${msg.toString()}`);
// 		});
// 		ws.on('close', (code, reason) => {
// 		  fastify.log.info('❌ WS disconnected, code: ' + code + ' reason: ' + (reason?.toString() || ''));
// 		});
// 		ws.on('error', (err) => {
// 		  fastify.log.error(`⚠️ WS error: ${err.message}`);
// 		});
// 	});
// };

fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send({ error: 'Not Found', message: `Route ${request.method} ${request.url} not found.` });
});

fastify.register(wsChat);
fastify.register(wsGame);

const start = async () => {
	//await startWebSocket();

  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    fastify.log.info('🚀 Server running at http://0.0.0.0:4000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
