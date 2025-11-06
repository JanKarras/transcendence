const { onGoingTournaments, onGoingLocalTournaments } = require("./tournamentStore");

function findTournamentByUser(userId) {
	for (const t of onGoingTournaments.values()) {
		if (t.players.some(p => p.id === userId)) return t;
	}
	return null;
}

function addSystemMessage(tournament, key, vars = null) {
	tournament.messages.push({
		type: "system",
		key,
		vars
	});
}

function addUserMessage(tournament, username, text) {
	tournament.messages.push({ type: "user", text: `${username}: ${text}` });
}

function checkTournamentReady(tournament) {
	const allJoined = tournament.players.every(p => p.status === "joined");
	tournament.ready = allJoined;
	if (allJoined) {
		addSystemMessage(tournament, "tournament.allPlayersJoined");
	} else {
		addSystemMessage(tournament, "tournament.notReady");
	}
	broadcastTournamentUpdate(tournament);
}

function broadcastTournamentUpdate(tournament) {
	if (!tournament) return;
	tournament.players.forEach(player => {
		if (player.ws) {
			player.ws.send(JSON.stringify({ type: "remoteTournamentUpdated", data: getTournamentForFrontend(tournament) }));
		}
	});
}

function deleteRemoteTournament(userId) {
	const tournamentRemote = onGoingTournaments.get(userId);
	if (tournamentRemote) {
		addSystemMessage(tournamentRemote, "tournament.hostEnded");
		broadcastTournamentUpdate(tournamentRemote);
		setTimeout(() => {
			for (let i = 1; i < tournamentRemote.players.length; i++) {
				const players = tournamentRemote.players[i];
				if (players.ws && players.ws.readyState === players.ws.OPEN) {
					players.ws.send(JSON.stringify({ type: "endTournament", data: { message: "Tournament ended by host." } }));
					players.ws.close();
				}
			}
			onGoingTournaments.delete(userId);
		}, 3000);
	}
}

function deleteLocalTournament(userId) {
	const tournamentLocal = onGoingLocalTournaments.get(userId);
	if (tournamentLocal) {
		onGoingLocalTournaments.delete(userId);
	}
}

function getTournamentForFrontend(tournament) {
	return {
		players: tournament.players.map(p => ({
			id: p.id,
			username: p.username,
			path: p.path,
			slot: p.slot,
			status: p.status,
			alias : p.alias
		})),
		messages: tournament.messages,
		ready: tournament.ready || false
	};
}




module.exports = {
	findTournamentByUser,
	addSystemMessage,
	addUserMessage,
	checkTournamentReady,
	broadcastTournamentUpdate,
	deleteLocalTournament,
	deleteRemoteTournament,
	getTournamentForFrontend,
}
