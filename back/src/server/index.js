require('dotenv').config();
const logger = require('../logger/logger');
const fastify = require('fastify')({ logger });
const fastifyCookie = require('@fastify/cookie');
const multipart = require('@fastify/multipart')
const { startWebSocketServer } = require('../websocket/ws');

fastify.register(multipart);

fastify.decorate('logger', logger);

fastify.register(require('../routes/getters/'), { prefix: '/api/get' });
fastify.register(require('../routes/setters/'), { prefix: '/api/set' });



fastify.register(fastifyCookie, {
  secret: process.env.JWT_SECRET,
  parseOptions: {}
});

fastify.setNotFoundHandler((request, reply) => {
  reply
    .code(404)
    .send({ error: 'Not Found', message: `Route ${request.method} ${request.url} not found.` });
});

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
	startWebSocketServer(fastify.server);
	logger.info('WebSocket server attached at /ws');
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();


//remote link = https://10.12.12.5
