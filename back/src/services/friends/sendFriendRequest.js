const userRepo = require("../../repositories/requestRepository");
const { sendChanges } = require("./sendChanges");

async function sendFriendRequest(userId, ws, data) {
	const receiverId  = data.userId;

	await userRepo.addFriendRequest(userId, receiverId);

	sendChanges(userId, receiverId);
}

module.exports = {
	sendFriendRequest
}
