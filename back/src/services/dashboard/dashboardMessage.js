const { ping } = require("../friends/ping");
const { declineTournamentInvite } = require("./declineTournamentInvite");

async function handleWsMessage(ws, userId, msg) {
	let data;
	try {
		data = JSON.parse(msg.toString());
	} catch {
		return ws.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
	}

	if(!userId) {
		return ws.send(JSON.stringify({ type: "error", error: "User not found" }))
	}

	const handlers = {
		ping,
		declineTournamentInvite,
	}

	const handler = handlers[data.type];
	if (handler) {
		await handler(userId, ws, data.data);
	} else {
		console.warn(`⚠️ Unknown message type: ${data.type}`);
	}
}

module.exports = {
	handleWsMessage
}
