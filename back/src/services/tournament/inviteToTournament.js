const userUtils = require("../../utils/userUtil");
const { onGoingTournaments } = require("./tournamentStore");
const tournamentUtils = require("./utils");
const requests = require("../../repositories/requestRepository");

async function inviteToTournament(userId, ws, data) {
	const tournamentData = inviteToTournamentFun(userId, data.guestId, data.slot);
	tournamentUtils.broadcastTournamentUpdate(tournamentData);
}

function inviteToTournamentFun(hostId, guestId, slot) {
	const user = userUtils.getUser(guestId);

	const tournament = onGoingTournaments.get(hostId);
	if (!tournament) {
		return null;
	}
	let player = null;
	if (slot === 2) player = tournament.players[1];
	else if (slot === 3) player = tournament.players[2];
	else if (slot === 4) player = tournament.players[3];

	player.id = guestId;
	player.username = user.username;
	player.path = user.path;
	player.status = "invited";

	tournamentUtils.addSystemMessage(tournament, `${user.username} has been invited.`);
	requests.addTournamentRequest(hostId, guestId);

	return tournament;
}

module.exports = {
	inviteToTournament
}
