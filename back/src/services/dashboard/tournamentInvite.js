const { activeDashboardSockets } = require("./dashboardStore");

async function tournamentInvite(invitedPlayer, userId) {
	const invitedPlayerWs = activeDashboardSockets.get(invitedPlayer.id);
	if (invitedPlayerWs) {
		const data = { gameId: userId };
		invitedPlayerWs.send(JSON.stringify({ type: "invitedToTournament", data }));
		return true;
	} else {
		return false;
	}
}

module.exports = {
	tournamentInvite
};

