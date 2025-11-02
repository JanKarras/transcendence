const chatRepository = require("../../../repositories/chatRepository");
const { sendToClient } = require("../chatUtils");

function handleInviteMessage(userId, ws, data) {
	const senderId = userId;
	const { to, content } = data;
	const friendId = to;
	
	console.log('Handling invite message:', data);
	console.log(`Sender ID: ${senderId}, Friend ID: ${friendId}, Content: ${content}`);
	if (content === 'sent') {
		chatRepository.addNewRequest(senderId, friendId);
	}
	else if (content === 'delete') {
		chatRepository.deleteRequest(senderId, friendId);
	}
	else if (content === 'accept') {
		sendToClient(friendId, {
			type: 'invite_message',
			friendId,
			content,
		});
	}

	sendToClient(friendId, {
		type: 'invite_message',
		friendId,
		content,
	});
}

module.exports = {
	handleInviteMessage
}