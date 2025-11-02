const chatRepository = require("../../repositories/chatRepository");
const { sendFriendStatus, sendCloseStatus } = require("./chatSenders");
const { activeDialog, clients } = require("./chstWsStore");

function handleWsClose(ws, userId, code, reason) {
    chatRepository.updateUserStatus(userId, 0);
    sendFriendStatus(userId, 0);
    sendCloseStatus(userId);

    activeDialog.delete(userId);
    clients.delete(userId);
}

module.exports = {
	handleWsClose
}
