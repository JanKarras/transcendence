const settersController = require('../../controller/setters');
const authMiddleware = require('../../middleware/auth');

module.exports = async function (fastify, opts) {
  fastify.post('/createUser', settersController.createUser);
  fastify.post('/login', settersController.login);
  fastify.post('/logout', settersController.logout);
  fastify.post('/emailValidation', settersController.emailValidation);
  fastify.post('/two_fa_api', settersController.two_fa_api);
  fastify.post('/updateUser', {preHandler: authMiddleware}, settersController.updateUser);
	fastify.post('/sendFriendRequest', {preHandler: authMiddleware}, settersController.sendFriendRequest);
};
