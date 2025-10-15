const tournamentUtils = require("./utils");
const userUtils = require("../../utils/userUtil");
const { onGoingLocalTournaments } = require("./tournamentStore");

async function createLocalTournament(userId, ws, data) {
	tournamentUtils.deleteRemoteTournament(userId);
	const tournamentLocal = createLocalTournamentFun(userId, ws);
	ws.send(JSON.stringify({ type: "LocalTournamentCreated", data: tournamentUtils.getTournamentForFrontend(tournamentLocal) }));
}

function createLocalTournamentFun(hostId, ws) {
	const user = userUtils.getUser(hostId);
	const tournament = {
		players: [
			{ id: hostId, username: user.username, path: user.path, slot: 1, status: "joined", ws: ws },
			{ id: null, username: "Player 2", slot: 2, status: "joined", path: null },
			{ id: null, username: "Player 3", slot: 3, status: "joined", path: null },
			{ id: null, username: "Player 4", slot: 4, status: "joined", path: null },
		],
		messages: []
	};
	onGoingLocalTournaments.set(hostId, tournament);
	return tournament;
}

module.exports = {
	createLocalTournament
}
