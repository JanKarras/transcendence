const { createRemoteTournament } = require("./createRemoteTournament");
const { inviteToTournament } = require("./inviteToTournament");
const { joinGame } = require("./joinGame");
const { tournamentChat } = require("./tournamentChat");
const { createLocalTournament } = require("./createLocalTournament");
const { updateLocalPlayerName } = require("./updateLocalPlayerName");
const { ping } = require("./ping");
const { startTournament } = require("./startTournament");
const { roundStart } = require("./roundStart");
const { roundWin } = require("./roundWin");

async function handleWsMessage(ws, userId, msg) {
	let data;
	try {
		data = JSON.parse(msg.toString());
	} catch {
		return ws.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
	}

	const handlers = {
		createRemoteTournament,
		inviteToTournament,
		joinGame,
		tournamentChat,
		createLocalTournament,
		updateLocalPlayerName,
		ping,
		startTournament,
		roundStart,
		roundWin
	}

	const handler = handlers[data.type];
	console.log(handler, "handler for", data.type);
	if (handler) {
		await handler(userId, ws, data.data);
	} else {
		console.warn(`⚠️ Unknown message type: ${data.type}`);
	}
}

module.exports = {
	handleWsMessage
}
