const userRepo = require("../../repositories/userRepository");
const { sendChanges } = require("./sendChanges");

async function removeFriend(userId, ws, data) {
	const { friendId } = data;

	userRepo.deleteFriends(userId, friendId);
	sendChanges(userId, friendId);
}

module.exports = {
	removeFriend
}
