function handleWsClose(ws, userId, code, reason) {
	console.log(`❌ WebSocket closed. Code: ${code}, Reason: ${reason?.toString() || 'No reason given'}`);
	
}

module.exports = {
	handleWsClose
}
