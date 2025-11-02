const { handleWsClose } = require("../services/chat/chatClose");
const { handleWsMessage } = require("../services/chat/chatMessage");
const { handleConnect } = require("../services/chat/handleConnect");
const userUtils = require("../utils/userUtil");

exports.chatRoute = async (fastify, options) => {
	fastify.get('/chat', { websocket: true }, (ws, request) => {
		const { token } = request.query;
		const userId = userUtils.getUserIdFromToken(token);

        handleConnect(ws, userId);

		ws.on('message', (msg) => handleWsMessage(ws, userId, msg));
		ws.on('close', (code, reason) => handleWsClose(ws, userId, code, reason));
		ws.on('error', (err) => fastify.log.error(`⚠️ WebSocket error: ${err.message}`));
	});
}
