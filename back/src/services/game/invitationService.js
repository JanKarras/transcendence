const userRepository = require("../../repositories/userRepository");
const gameStore = require("./gameStore");
const { GameState, CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED, PADDLE_WIDTH } = require("../../constants/constants");
const matchService = require("../../services/game/matchService");


function createMatch(userData1, userData2) {
	console.log("createMatch");
	const matchData = matchService.initRemoteMatch(userData1, userData2);
	gameStore.onGoingMatches.push(matchData);
	userData1.ws.send(JSON.stringify({ type: "invitationAccepted", opponent: matchData.userId2 }));
	userData2.ws.send(JSON.stringify({ type: "invitationAccepted", opponent: matchData.userId1 }));
}

function accept(userId) {
	// fetch own data from gameStore
	const data = gameStore.connectedUsers.get(userId);
	
	// find other user in pendingInvitations
	// const [otherUserId, otherData] = gameStore.pendingInvitations.;
	// if (!otherData) console.error();
	
	// delete pending invitation from map
	gameStore.pendingInvitations.delete(otherUserId);
	// create the Match
	createMatch(otherData, data);
}

function invite(userId) {
	// fetch own data from gameStore
	const data = gameStore.connectedUsers.get(userId);

	gameStore.pendingInvitations.set(userId, data);
}

module.exports = {
	accept,
	invite,
	createMatch
}