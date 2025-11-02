const { clients } = require("./chstWsStore")
const chatRepository = require("../../repositories/chatRepository");
const { sendFriendStatus } = require("./chatSenders");

function handleConnect(ws, userId) { 
	clients.set(userId, ws);
	ws.send(JSON.stringify({ type: 'init', senderId: userId }));

	chatRepository.updateUserStatus(userId, 1);

	sendFriendStatus(userId, 1);
}

module.exports = {
	handleConnect
}