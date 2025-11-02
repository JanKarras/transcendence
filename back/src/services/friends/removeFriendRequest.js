const userRepo = require("../../repositories/userRepository");
const requestRepo = require("../../repositories/requestRepository");
const { sendChanges } = require("./sendChanges");
const { notifyDashboard } = require("./notifyDashboard");

async function removeFriendRequest(userId, ws, data) {
	const { requestId }  = data;

	const request = await requestRepo.getRequestById(requestId);

	requestRepo.deleteRequestById(requestId);

	sendChanges(request.sender_id, request.receiver_id);

	notifyDashboard(request.receiver_id, 2);
}

module.exports = {
	removeFriendRequest
}
