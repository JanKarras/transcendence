const chatRepository = require("../../../repositories/chatRepository");
const { sendHasNewMessage } = require("../chatSenders");
const { sendToClient } = require("../chatUtils");
const { activeDialog, clients } = require("../chstWsStore");

function handleSendMessage(userId, ws, data) {
    const senderId = userId;
    const { friendId, content } = data;


    const info = chatRepository.addMessage(senderId, friendId, content);

    const messageId = info.lastInsertRowid;
    const hasSocket = clients.has(friendId);
    const isPeerOpenWithMe = activeDialog.get(friendId) === senderId;

    let delivered = false;
    if (hasSocket && isPeerOpenWithMe) {
        const senderName = chatRepository.getUsername(senderId);
        delivered = sendToClient(friendId, {
            type: 'chat',
            friendId,
            senderName,
            content,
        });
    }

    if (!delivered) {
        chatRepository.setMessageAsRead(messageId);
        sendHasNewMessage(senderId, friendId, 1);
    }
}

module.exports = {
    handleSendMessage
}