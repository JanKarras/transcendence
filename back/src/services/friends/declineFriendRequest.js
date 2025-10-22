const userRepo = require("../../repositories/userRepository");
const requestRepo = require("../../repositories/requestRepository");
const { sendChanges } = require("./sendChanges");

async function declineFriendRequest(userId, ws, data) {
	const { requestId }  = data;

	const request = await requestRepo.getRequestById(requestId);

	requestRepo.updateRequestStatusById("declined", requestId);

	sendChanges(request.sender_id, request.receiver_id);
}

module.exports = {
	declineFriendRequest
}
