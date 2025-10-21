const { handleWsClose } = require("../services/friends/friendWsClose");
const { handleWsMessage } = require("../services/friends/friendWsMessage");
const { activeFriendSockets } = require("../services/friends/friendsStore");
const { sendFriendsUpdate } = require("../services/friends/sendFriendUpdate");
const userUtils = require("../utils/userUtil");

exports.friendRoute = async (fastify, options) => {
	fastify.get('/friends', { websocket: true }, (ws, request) => {
		const { token } = request.query;
		const userId = userUtils.getUserIdFromToken(token);
		activeFriendSockets.set(userId, ws);
		sendFriendsUpdate(userId, ws);

		ws.on('message', (msg) => handleWsMessage(ws, userId, msg));
		ws.on('close', (code, reason) => handleWsClose(ws, userId, code, reason));
		ws.on('error', (err) => fastify.log.error(`⚠️ WebSocket error: ${err.message}`));
	});
}