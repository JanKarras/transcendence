const { addMessage } = require("../../repositories/chatRepository");
const userRepo = require("../../repositories/userRepository");
const { sendChanges } = require("./sendChanges");

async function removeFriend(userId, ws, data) {
	const { friendId } = data;

	userRepo.deleteFriends(userId, friendId);
	addMessage(userId, friendId, "You are no longer friends.");
	sendChanges(userId, friendId);
}

module.exports = {
	removeFriend
}
