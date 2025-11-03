const { activeFriendSockets } = require("./friendsStore");

function handleWsClose(ws, userId, code, reason) {
	activeFriendSockets.delete(userId);
	console.log(`❌ WebSocket closed. Code: ${code}, Reason: ${reason?.toString() || 'No reason given'}`);
}

module.exports = {
	handleWsClose
}
