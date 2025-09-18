const matchService = require("../services/game/matchService");

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

        console.log(`📊 Match-History für userId ${userIdNum}:`, matchesWithPlayers);

        reply.code(200).send({ matchHistory: matchesWithPlayers });
    } catch (err) {
        console.error('Error fetching match history:', err);
        reply.code(500).send({ error: 'DB Error' });
    }
};
