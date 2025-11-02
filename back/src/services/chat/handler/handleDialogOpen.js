const chatRepo = require("../../../repositories/chatRepository");
const { sendToClient } = require("../chatUtils");
const { activeDialog } = require("../chstWsStore");

function handleDialogOpen(userId, ws, data) {
	console.log(data)
	const senderId = userId;
	const { friendId, content } = data;
	if (content === '2') {
		const prevFriendId = activeDialog.get(senderId);
		activeDialog.delete(senderId);

		if (prevFriendId) {
			sendToClient(prevFriendId, {
				type: 'read_receipt',
				readerId: senderId,
				content: '2',
			});
		}
		return;
	}

	activeDialog.set(senderId, friendId);
	const isPeerOpenWithMe = activeDialog.get(friendId) === senderId;

	chatRepo.markMessagesAsRead(friendId, senderId);

	sendToClient(senderId, {
		type: 'read_receipt',
		readerId: friendId,
		content: isPeerOpenWithMe ? '1' : '0',
	});

	if (isPeerOpenWithMe) {
		if (content === '4') {
			sendToClient(friendId, {
				type: 'peer_dialog_open',
				peerId: senderId,
			});
		}
		sendToClient(friendId, {
			type: 'read_receipt',
			readerId: senderId,
			content: '1',
		});
	}
}

module.exports = {
	handleDialogOpen
}