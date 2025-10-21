function ping(userId, ws, data) {
	ws.send(JSON.stringify({ type: "pong" }));
}

module.exports = {
	ping
}
