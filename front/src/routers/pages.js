module.exports = async function (fastify, opts) {
  fastify.get('/', async (request, reply) => {
    return reply.sendFile('index.html'); // lädt public/index.html
  });

};
