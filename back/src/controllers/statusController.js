const statusRepository = require("../repositories/statusRepository");
const validator = require("../utils/validator");

exports.getStatus = async (req, reply) => {
	const userId = req.user?.id;
	if (!userId) {
		return reply.code(401).send({ error: 'Unauthorized' });
	}

	const { friendId: friendIdRaw } = req.params;
	const friendId = Number(friendIdRaw);
	if (!validator.validateFriendId(friendId)) {
		return reply.code(400).send({ error: 'friendId must be a positive integer' });
	}

	const status = await statusRepository.getStatusByUserId(friendId)?.status === 1 ? 1 : 0;
	return reply.send({ status: status });
};