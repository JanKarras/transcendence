const matchRepository = require("../repositories/matchRepository");
const matchPlayerRepository = require("../repositories/matchPlayerRepository");

function getMatchesWithPlayersByUserId(userId) {
    const userMatches = matchRepository.getMatchesByUserId(userId);
    return userMatches.map(match => {
        const players = matchPlayerRepository.getPlayersByMatchId(match.id)
        return {
            ...match,
            players
        };
    });
}

module.exports = {
    getMatchesWithPlayersByUserId,
}