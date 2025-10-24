const tournamentServiceUtils = require("./utils");
const { onGoingTournaments } = require("./tournamentStore");

function handleWsClose(ws, userId, code, reason) {
	console.log(`❌ WebSocket closed. Code: ${code}, Reason: ${reason?.toString() || 'No reason given'}`);

	const tournament = onGoingTournaments.get(userId);
	if (tournament) {
		endTournament(tournament, userId);
	} else {
		playerLeftTournament(userId);
	}
}

function endTournament(tournament, userId) {
	tournamentServiceUtils.addSystemMessage(tournament, `Host has ended the tournament.`);
	tournamentServiceUtils.broadcastTournamentUpdate(tournament);

	setTimeout(() => {
		tournament.players.forEach(p => {
			if (p.ws) {
				p.ws.send(JSON.stringify({ type: "endTournament", data: { message: "Tournament ended by host." } }));
			}
		});
		tournament.players.forEach(p => {
			if (p.ws && p.ws.readyState === p.ws.OPEN) {
				p.ws.close();
			}
		});
		onGoingTournaments.delete(userId);
	}, 2000);
}

function playerLeftTournament(userId) {
	const tournament = tournamentServiceUtils.findTournamentByUser(userId);
	if (!tournament) return;
	if (tournament.started) {
		tournamentServiceUtils.addSystemMessage(tournament, `A player has disconnected. Tournament is cancelled.`);
		tournamentServiceUtils.broadcastTournamentUpdate(tournament);
		for (const player of tournament.players) {
			const userId = player.id;
			if (onGoingTournaments.has(userId)) {
				endTournament(tournament, userId);
			}
		}
	} else {
		const player = tournament.players.find(p => p.id === userId);
		if (!player) return;
		player.status = "left";
		player.ws = null;
		tournamentServiceUtils.addSystemMessage(tournament, `${player.username} has left the tournament.`);
		tournamentServiceUtils.checkTournamentReady(tournament);
		tournamentServiceUtils.broadcastTournamentUpdate(tournament);
	}
}



module.exports = {
	handleWsClose
}
