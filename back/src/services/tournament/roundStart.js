const tournamentUtils = require("./utils");

async function roundStart(userId, ws, data) {
	const { playerLeft, playerRight } = data;
	const tournament = tournamentUtils.findTournamentByUser(userId);
	if (!tournament) return;
	if (tournament.roundStartMsgCounter <= 1) {
		const roundText = tournament.round === 0 ? "First Round" : "Second Round";
		tournamentUtils.addSystemMessage(tournament, `${roundText} is about to start: ${playerLeft?.name || "Player1"} vs ${playerRight?.name || "Player2"}`);
		tournament.roundStartMsgCounter++;
	}
	tournamentUtils.broadcastTournamentUpdate(tournament);
}

module.exports = {
	roundStart
}
 