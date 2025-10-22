const { activeFriendSockets } = require("../friends/friendsStore");
const sendFriendsUpdate = require("./sendFriendUpdate");

async function sendChanges(userId1, userId2) {
	const ws1 = activeFriendSockets.get(userId1);
	const ws2 = activeFriendSockets.get(userId2);

	if (ws1) {
		sendFriendsUpdate.sendFriendsUpdate(userId1, ws1);
	}
	if (ws2) {
		sendFriendsUpdate.sendFriendsUpdate(userId2, ws2);
	}
}

module.exports = {
	sendChanges
};
