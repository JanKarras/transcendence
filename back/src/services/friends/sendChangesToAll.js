const { activeFriendSockets } = require("../friends/friendsStore");
const sendFriendsUpdate = require("./sendFriendUpdate");
const userRepo = require('../../repositories/userRepository');

async function sendChangesToAll(userId) {

	const friends = await userRepo.getFriends(userId);

	console.log("Friends found", friends)
	for (const friend of friends) {
		const ws = activeFriendSockets.get(friend.id);
		if (ws) {
			sendFriendsUpdate.sendFriendsUpdate(friend.id, ws);
		}
	}
}

module.exports = {
	sendChangesToAll
};
