const chatRepository = require("../../../repositories/chatRepository");
const { notifyPeer } = require("../chatSenders");

function handleBlock(userId, ws, data) {
	const senderId = userId;
	const { blockedId, content } = data;
	const friendId = blockedId;
	if (content === 'block') {
		chatRepository.blockUser(senderId, friendId);
		notifyPeer(friendId, senderId, 'block');
	} else if (content === 'unblock') {
		chatRepository.unblockUser(senderId, friendId);
		notifyPeer(friendId, senderId, 'unblock');
	}
}

module.exports = {
	handleBlock
}