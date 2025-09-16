const userController = require('../../controllers/userController');
const authController = require('../../controllers/authController');
const requestController = require('../../controllers/requestController');
const gameController = require('../../controllers/gameController');
const authMiddleware = require('../../middleware/auth');

module.exports = async function (fastify, opts) {
  fastify.post('/createUser', userController.createUser);
  fastify.post('/login', authController.login);
  fastify.post('/logout', authController.logout);
  fastify.post('/emailValidation', authController.emailValidation);
  fastify.post('/two_fa_api', authController.two_fa_api);
  fastify.post('/updateUser', {preHandler: authMiddleware}, userController.updateUser);
  fastify.post('/sendFriendRequest', {preHandler: authMiddleware}, requestController.sendFriendRequest);
  fastify.post('/handleAcceptRequest', {preHandler: authMiddleware}, requestController.handleAcceptRequest);
  fastify.post('/handleDeclineRequest', {preHandler: authMiddleware}, requestController.handleDeclineRequest);
  fastify.post('/removeFriend', {preHandler: authMiddleware}, userController.removeFriend);
  fastify.post('/matchmaking/join',{ preHandler: authMiddleware }, gameController.joinQueue);
};
