const { onGoingLocalTournaments } = require("./tournamentStore");
const tournamentUtils = require("./utils");

async function updateLocalPlayerName(userId, ws, data) {
	updateLocalName(data.slot, data.name, userId, ws);
}

function updateLocalName(slot, name, hostId, ws) {
	const tournament = onGoingLocalTournaments.get(hostId);
	if (tournament) {
		const player = tournament.players.find(p => p.slot === slot);
		if (player) {
			player.username = name;
		}
		ws.send(JSON.stringify({ type: "localTournamentUpdated", data: tournamentUtils.getTournamentForFrontend(tournament) }));
	}
}

module.exports = {
	updateLocalPlayerName
}
