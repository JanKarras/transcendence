const { handleWsMessage } = require("../services/dashboard/dashboardMessage");
const { handleWsClose } = require("../services/dashboard/dashboardWsClose");
const { activeDashboardSockets } = require("../services/dashboard/dashboardStore");
const userUtils = require("../utils/userUtil");

exports.dashboardRoute = async (fastify, options) => {
	fastify.get('/dashboard', { websocket: true }, (ws, request) => {
		const { token } = request.query;
		const userId = userUtils.getUserIdFromToken(token);
		activeDashboardSockets.set(userId, ws);

		ws.on('message', (msg) => handleWsMessage(ws, userId, msg));
		ws.on('close', (code, reason) => handleWsClose(ws, userId, code, reason));
		ws.on('error', (err) => fastify.log.error(`⚠️ WebSocket error: ${err.message}`));
	});
}
