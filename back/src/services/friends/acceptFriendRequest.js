const userRepo = require("../../repositories/userRepository");
const requestRepo = require("../../repositories/requestRepository");
const { sendChanges } = require("./sendChanges");
const { notifyDashboard } = require("./notifyDashboard");
const { addMessage } = require("../../repositories/chatRepository");

async function acceptFriendRequest(userId, ws, data) {
	const { requestId }  = data;

	const request = await requestRepo.getRequestById(requestId);

	requestRepo.deleteAllFriendRequestsBetween(request.sender_id, request.receiver_id);

	userRepo.addFriend(request.sender_id, request.receiver_id);

	sendChanges(request.sender_id, request.receiver_id);

	addMessage(request.sender_id, request.receiver_id, "SYS_MSG:cht.nowFriends");
	
	notifyDashboard(request.receiver_id, 2);
}

module.exports = {
	acceptFriendRequest
}
