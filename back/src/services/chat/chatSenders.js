const { broadcast, sendToClient } = require("./chatUtils");
const chatRepository = require("../../repositories/chatRepository");
const { activeDialog } = require("./chstWsStore");

function sendFriendStatus(userId, status) {
	broadcast({ type: 'friend_status', userId, status });
}

function sendCloseStatus(userId) {
	broadcast({ type: 'read_receipt', readerId: userId, content: '0' });
}

function sendHasNewMessage(userId, friendId, status) {
	sendToClient(friendId, { type: 'new_message', userId, friendId, status });
}

function notifyPeer(friendId, senderId, content) {
	const isPeerOpenWithMe = activeDialog.get(friendId) === senderId;
	if (!isPeerOpenWithMe) return;

	const senderName = chatRepository.getUsername(senderId);

	sendToClient(friendId, {
		type: 'chat-block',
		friendId,
		senderName,
		content,
	});
}


module.exports = { 
	sendFriendStatus,
	sendCloseStatus,
	sendHasNewMessage,
	notifyPeer
}