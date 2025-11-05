const matchService = require("../services/game/matchService");
const gameStore = require("../services/game/gameStore");

exports.getMatchHistory = async (req, reply) => {
	try {
		const { userId } = req.query;

		if (!userId || typeof userId !== 'string') {
			return reply.code(400).send({ error: 'Missing userId parameter' });
		}

		const userIdNum = Number(userId);
		if (!Number.isInteger(userIdNum)) {
			return reply.code(400).send({ error: "Invalid userId" });
		}

		const matchesWithPlayers = await matchService.getMatchesWithPlayersByUserId(userId);

		reply.code(200).send({ matchHistory: matchesWithPlayers });
	} catch (err) {
		console.error('Error fetching match history:', err);
		reply.code(500).send({ error: 'DB Error' });
	}
};


exports.getMatchState = async (req, reply) => {
	try {
		const { userId } = req.query;

		if (!userId || typeof userId !== 'string') {
			return reply.code(400).send({ error: 'Missing userId parameter' });
		}

		const userIdNum = Number(userId);
		if (!Number.isInteger(userIdNum)) {
			return reply.code(400).send({ error: "Invalid userId" });
		}

		const match = gameStore.onGoingMatches.find(
			m => m.userId1 === userIdNum || m.userId2 === userIdNum
		);

		reply.code(200).type('application/json').send({
			gameState: match.gameState,
			gameInfo: match.gameInfo,
		});
	} catch (err) {
		console.error('Error fetching match history:', err);
		reply.code(400).send({ error: 'There is no active game for the user' });
	}
};