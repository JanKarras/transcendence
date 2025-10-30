const { findTournamentByUser, addSystemMessage, broadcastTournamentUpdate } = require("../tournament/utils");

function declineTournamentInvite(userId, ws, data) {
	const tournament = findTournamentByUser(data.gameId);
	if (!tournament) {
		console.warn(`⚠️ Kein aktives Turnier für gameId ${data.gameId} gefunden.`);
		return;
	}

	const player = tournament.players.find(p => p.id === userId);
	if (!player) {
		console.warn(`⚠️ Spieler ${userId} wurde in Turnier ${data.gameId} nicht gefunden.`);
		return;
	}

	addSystemMessage(tournament, `❌ ${player.username} hat die Einladung abgelehnt.`);

	player.id = null;
	player.username = null;
	player.path = null;
	player.status = "empty";

	broadcastTournamentUpdate(tournament);

	console.log(`📨 Spieler ${userId} (${player.username}) hat die Einladung abgelehnt.`);
}

module.exports = {
	declineTournamentInvite
}
