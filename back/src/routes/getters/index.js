const messageController = require('../../controllers/messageController');
const imageController = require('../../controllers/imageController');
const statusController = require('../../controllers/statusController');
const matchController = require('../../controllers/matchController');
const authController = require('../../controllers/authController');
const userController = require('../../controllers/userController');
const gameController = require('../../controllers/gameController');
const statisticsController = require('../../controllers/statisticsController');
const authMiddleware = require('../../middleware/auth');

module.exports = async function (fastify, opts) {
	fastify.get('/is_logged_in', {preHandler: authMiddleware}, authController.is_logged_in);
	fastify.get('/getUser', {preHandler: authMiddleware}, userController.getUser);
	fastify.get('/getImage', {preHandler: authMiddleware}, imageController.getImage);
	fastify.get('/getAllUser', {preHandler: authMiddleware}, userController.getAllUser);
	fastify.get('/getUserForProfile', {preHandler: authMiddleware}, userController.getUserForProfile);
	fastify.get('/friends',{ preHandler: authMiddleware },userController.getFriends);
	fastify.get('/messages/:friendId',{ preHandler: authMiddleware },messageController.getMessages);
	fastify.get('/blocked/:friendId',{ preHandler: authMiddleware },userController.getBlocked);
	fastify.get('/status/:friendId',{ preHandler: authMiddleware },statusController.getStatus);
	fastify.get('/token',{ preHandler: authMiddleware },authController.getToken);
	fastify.get('/getMatchHistory',{ preHandler: authMiddleware },matchController.getMatchHistory);
	fastify.get('/gameState',{ preHandler: authMiddleware },matchController.getMatchState);
	fastify.get('/unread/:friendId',{ preHandler: authMiddleware }, messageController.getUnread);
	fastify.get('/2fa/setup',{ preHandler: authMiddleware }, userController.twoFaSetUp);
	fastify.get('/getStats', { preHandler: authMiddleware }, statisticsController.getStats);
	fastify.get('/getFriendsData', { preHandler: authMiddleware }, userController.getFriendsData);
};


