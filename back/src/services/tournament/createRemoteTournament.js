const { onGoingTournaments } = require("./tournamentStore");
const userUtils = require("../../utils/userUtil");
const tournamentUtils = require("./utils");

async function createRemoteTournament(userId, ws, data) {
	tournamentUtils.deleteLocalTournament(userId);
	const tournament = createRemote(userId, ws);
	ws.send(JSON.stringify({ type: "tournamentCreated", data: tournamentUtils.getTournamentForFrontend(tournament) }));
}

function createRemote(hostId, ws) {
	const user = userUtils.getUser(hostId);
	const tournament = {
		players: [
			{ id: hostId, username: user.username, path: user.path, slot: 1, status: "joined", ws: ws },
			{ id: null, username: null, path: null, slot: 2, status: null, ws: null },
			{ id: null, username: null, path: null, slot: 3, status: null, ws: null },
			{ id: null, username: null, path: null, slot: 4, status: null, ws: null },
		],
		messages: [],
		matches: [],
		ready: false,
		started : false,
		round : 0,
		roundStartMsgCounter : 0,
		gamesFinishedCoutner : 0,
	};
	onGoingTournaments.set(hostId, tournament);
	return tournament;
}

module.exports = {
	createRemoteTournament
}
