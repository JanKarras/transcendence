require('dotenv').config();
const logger = require('../logger/logger');
const Fastify = require('fastify');
const fastifyCookie = require('@fastify/cookie');
const multipart = require('@fastify/multipart');
const fastifyWebsocket = require('@fastify/websocket');
// const wsGame = require('../controllers/gameController');
const gameController = require('../controllers/gameController');
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

fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send({ error: 'Not Found', message: `Route ${request.method} ${request.url} not found.` });
});

fastify.register(wsChat);
fastify.register(gameController.chatWebSocketRoute);
// fastify.register(wsGame);

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
    fastify.log.info('🚀 Server running at http://0.0.0.0:4000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
