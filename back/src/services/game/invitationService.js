const userRepository = require("../../repositories/userRepository");
const gameStore = require("./gameStore");
const { GameState, CANVAS_WIDTH, CANVAS_HEIGHT, PADDLE_HEIGHT, PADDLE_SPEED, PADDLE_WIDTH } = require("../../constants/constants");
const matchService = require("../../services/game/matchService");


function createMatch(userData1, userData2) {
	const matchData = matchService.initRemoteMatch(userData1, userData2);
	gameStore.onGoingMatches.push(matchData);
	userData1.ws.send(JSON.stringify({ type: "invitationAccepted", opponent: matchData.userId2 }));
	userData2.ws.send(JSON.stringify({ type: "invitationAccepted", opponent: matchData.userId1 }));
}

function accept(userId) {
	const data = gameStore.connectedUsers.get(userId);

	gameStore.pendingInvitations.delete(otherUserId);
	createMatch(otherData, data);
}

function invite(userId) {
	const data = gameStore.connectedUsers.get(userId);

	gameStore.pendingInvitations.set(userId, data);
}

module.exports = {
	accept,
	invite,
	createMatch
}
