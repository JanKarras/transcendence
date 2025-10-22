const userRepo = require("../../repositories/userRepository");
const requestRepo = require("../../repositories/requestRepository");
const { sendChanges } = require("./sendChanges");

async function acceptFriendRequest(userId, ws, data) {
	const { requestId }  = data;

	const request = await requestRepo.getRequestById(requestId);

	requestRepo.deleteAllFriendRequestsBetween(request.sender_id, request.receiver_id);

	userRepo.addFriend(request.sender_id, request.receiver_id);

	sendChanges(request.sender_id, request.receiver_id);
}

module.exports = {
	acceptFriendRequest
}
