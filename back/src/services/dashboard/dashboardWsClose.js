const { activeDashboardSockets } = require("./dashboardStore")

function handleWsClose(ws, userId, code, reason) {
	activeDashboardSockets.delete(userId);
}

module.exports = {
	handleWsClose
}
