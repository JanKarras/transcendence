require('dotenv').config();
const logger = require('../logger/logger');
const fastify = require('fastify')({ logger });

fastify.decorate('logger', logger);

fastify.register(require('../routes/getters/'), { prefix: '/api/get' });
fastify.register(require('../routes/setters/'), { prefix: '/api/set' });

fastify.setNotFoundHandler((request, reply) => {
  reply
    .code(404)
    .send({ error: 'Not Found', message: `Route ${request.method} ${request.url} not found.` });
});

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' });
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
