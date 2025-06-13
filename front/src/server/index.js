const path = require('path');
const logger = require('../logger/logger');
const fastify = require('fastify')({ logger });
const fastifyStatic = require('@fastify/static'); 

fastify.decorate('logger', logger);

fastify.register(fastifyStatic, {
  root: path.join(__dirname, '../../public'),
  prefix: '/',
});

fastify.register(require('../routers/pages'));

const start = async () => {
  try {
    await fastify.listen({ port: 4001, host: '0.0.0.0' });
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
};

start();
