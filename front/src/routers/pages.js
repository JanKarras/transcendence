module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    return reply.sendFile('index.html'); // lädt public/index.html
  });

fastify.get('/email_validation', async (request, reply) => {
    return reply.sendFile('email_validation.html'); // lädt public/index.html
  });
};
