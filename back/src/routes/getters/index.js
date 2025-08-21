const gettersController = require('../../controller/getters');
const authMiddleware = require('../../middleware/auth');

module.exports = async function (fastify, opts) {
	fastify.get('/is_logged_in', {preHandler: authMiddleware}, gettersController.is_logged_in);
	fastify.get('/getUser', {preHandler: authMiddleware}, gettersController.getUser);
	fastify.get('/getImage', {preHandler: authMiddleware}, gettersController.getImage);
	fastify.get('/getAllUser', {preHandler: authMiddleware}, gettersController.getAllUser);
	fastify.get('/getUserForProfile', {preHandler: authMiddleware}, gettersController.getUserForProfile);
	fastify.get('/friends',{ preHandler: authMiddleware },gettersController.getFriends);
	fastify.get('/messages/:friendId',{ preHandler: authMiddleware },gettersController.getMessages);
	fastify.get('/blocked/:friendId',{ preHandler: authMiddleware },gettersController.getBlocked);
	fastify.get('/status/:friendId',{ preHandler: authMiddleware },gettersController.getStatus);
	fastify.get('/token',{ preHandler: authMiddleware },gettersController.getToken);
	fastify.get('/getMatchHistory',{ preHandler: authMiddleware },gettersController.getMatchHistory);
};


