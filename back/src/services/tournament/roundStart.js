const tournamentUtils = require("./utils");

async function roundStart(userId, ws, data) {
	const { playerLeft, playerRight } = data;
	if (userId == playerLeft.userId) return;

	const tournament = tournamentUtils.findTournamentByUser(userId);
	if (!tournament) return;

	if (tournament.roundStartMsgCounter <= 1) {
		const roundKey = tournament.round === 0
			? "tournament.round1"
			: "tournament.round2";

		tournamentUtils.addSystemMessage(
			tournament,
			"tournament.roundStarting",
			{
				round: roundKey,
				player1: playerLeft?.alias || "Player1",
				player2: playerRight?.alias || "Player2"
			}
		);

		tournament.roundStartMsgCounter++;
	}

	tournamentUtils.broadcastTournamentUpdate(tournament);
}


module.exports = {
	roundStart
}
