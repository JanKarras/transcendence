const userUtils = require("../utils/userUtil");

const { handleWsClose } = require("../services/tournament/tournamentWsClose");
const { handleWsMessage } = require("../services/tournament/tournamentWsMessage");

exports.tournamentRoute = async (fastify, options) => {
	fastify.get('/tournament', { websocket: true }, (ws, request) => {
		const { token } = request.query;
		const userId = userUtils.getUserIdFromToken(token);

		ws.on('message', (msg) => handleWsMessage(ws, userId, msg));
		ws.on('close', (code, reason) => handleWsClose(ws, userId, code, reason));
		ws.on('error', (err) => fastify.log.error(`⚠️ WebSocket error: ${err.message}`));
	});
}





