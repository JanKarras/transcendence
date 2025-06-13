const logger = require('../logger/logger');
const fastify = require('fastify')({ logger });

fastify.decorate('logger', logger);

fastify.get('/api/', async (request, reply) => {
	logger.info('Root route accessed');
	return { hello: 'world4654654654654654' };
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
