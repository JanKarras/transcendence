const { onGoingTournaments } = require("./tournamentStore");
const tournamentUtils = require("./utils");

async function joinGame(userId, ws, data) {
	const tournamentToJoinData = joinTournament(data.gameId, userId, ws);
	tournamentUtils.broadcastTournamentUpdate(tournamentToJoinData);
}

function joinTournament(gameId, userId, ws) {
	const tournament = onGoingTournaments.get(gameId);
	if (!tournament) {
		ws.send(JSON.stringify({ type: "tournamentNotFound" }));
		return null;
	}
	console.log(`✅ User ${userId} is attempting to join tournament ${gameId}`);
	for (let i = 0; i < tournament.players.length; i++) {
		const player = tournament.players[i];
		console.log(`Checking player slot ${player.slot}: id=${player.id}, status=${player.status}`);
		if (player.id === userId && player.status === "invited") {
			player.status = "joined";
			player.ws = ws;
			tournamentUtils.addSystemMessage(tournament, `${player.username} joined the tournament.`);
			tournamentUtils.checkTournamentReady(tournament);
			return tournament;
		}
	}
}

module.exports = {
	joinGame
}
