const userUtils = require("../../utils/userUtil");
const { onGoingTournaments } = require("./tournamentStore");
const tournamentUtils = require("./utils");
const requests = require("../../repositories/requestRepository");
const { tournamentInvite } = require("../dashboard/tournamentInvite");
const { createRemote } = require("./createRemoteTournament");

async function inviteToTournament(userId, ws, data) {
	const tournamentData = await inviteToTournamentFun(userId, data.guestId, data.slot, ws);
	tournamentUtils.broadcastTournamentUpdate(tournamentData);
}

async function inviteToTournamentFun(hostId, guestId, slot, ws) {
	const user = userUtils.getUser(guestId);

	let tournament = onGoingTournaments.get(hostId);
	if (!tournament) {
		console.warn(`⚠️ Tournament not found for hostId in inviteToTournamentFun: ${hostId}`);
		tournament = createRemote(hostId, ws)
	}

	let player = null;
	if (slot === 2) player = tournament.players[1];
	else if (slot === 3) player = tournament.players[2];
	else if (slot === 4) player = tournament.players[3];

	player.id = guestId;
	player.username = user.username;
	player.path = user.path;
	player.status = "invited";
	player.alias = user.alias;
	const invited = await tournamentInvite(player, hostId);
	if (!invited) {
		tournamentUtils.addSystemMessage(tournament, "tournament.userBusy", { username: user.alias });


		player.id = null;
		player.username = null;
		player.path = null;
		player.status = "empty";
		player.alias = null

		return tournament;
	}

	tournamentUtils.addSystemMessage(tournament, "tournament.playerInvited", { username: user.alias });
	requests.addTournamentRequest(hostId, guestId);

	return tournament;
}

module.exports = {
	inviteToTournament
}
