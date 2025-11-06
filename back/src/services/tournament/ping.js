const { updateLastSeen } = require("../../repositories/userRepository");

function ping(userId, ws, data) {
	ws.send(JSON.stringify({ type: "pong" }));
	updateLastSeen(userId);
}

module.exports = {
	ping
}
