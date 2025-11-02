const statsRepository = require("../repositories/statsRepository");
const validator = require("../utils/validator");

exports.getStats = async (req, reply) => {
	const { userId } = req.query;
	if (!userId) {
		return reply.code(401).send({ error: 'Unauthorized' });
	}

	const stats = statsRepository.getStatsByUserId(userId);
	return reply.send(stats);
};