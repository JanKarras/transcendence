const userRepo = require("../../repositories/requestRepository");
const { notifyDashboard } = require("./notifyDashboard");
const { sendChanges } = require("./sendChanges");

async function sendFriendRequest(userId, ws, data) {
	const receiverId  = data.userId;

	await userRepo.addFriendRequest(userId, receiverId);

	notifyDashboard(receiverId, 1);

	sendChanges(userId, receiverId);
}

module.exports = {
	sendFriendRequest
}
