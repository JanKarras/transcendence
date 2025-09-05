const messageRepository = require("../repositories/messageRepository");

exports.getMessages = async (req, reply) => {
    const userId = req.user.id;
    const { friendId } = req.params;
    const messages = await messageRepository.getMessagesByUserIdAndFriendId(userId, friendId);
    reply.send(messages);
};

exports.getUnread = async (req, reply) => {
    const userId = req.user.id;
    const { friendId } = req.params;
	const res = await messageRepository.getUnreadDB(userId, friendId);
	console.log('Unread messages count:', res);
    reply.send({ has_unread: res });
};
