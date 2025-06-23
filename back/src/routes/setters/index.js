const settersController = require('../../controller/setters');

module.exports = async function (fastify, opts) {
  fastify.post('/createUser', settersController.createUser);
  fastify.post('/login', settersController.login);
  fastify.post('/logout', settersController.logout);
  fastify.post('/emailValidation', settersController.emailValidation);
  fastify.post('/two_fa_api', settersController.two_fa_api);
};
