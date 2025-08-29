const messageRepository = require("../repositories/messageRepository");

exports.getMessages = async (req, reply) => {
    const userId = req.user.id;
    const { friendId } = req.params;
    const messages = await messageRepository.getMessagesByUserIdAndFriendId(userId, friendId);
    reply.send(messages);
};