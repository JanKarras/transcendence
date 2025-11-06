const tournamentUtils = require("./utils");
const userUtils = require("../../utils/userUtil");

async function tournamentChat(userId, ws, data) {
	const tournament = tournamentUtils.findTournamentByUser(userId);
	if (!tournament) return;
	const user = userUtils.getUser(userId);
	tournamentUtils.addUserMessage(tournament, user.alias, data.message);
	tournamentUtils.broadcastTournamentUpdate(tournament);
}

module.exports = {
	tournamentChat
}
