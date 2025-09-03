const { match } = require('assert');
const userUtils = require('../utils/userUtil');

const lookingForMatch = new Map();
const onGoingMatches = [];

function pairMatch(userData1, userData2) {
	const matchData = {
		userId1 : userData1.userId,
		userId2 : userData2.userId,
		gameState : 'notStarted'
	}

	onGoingMatches.push(matchData);
	console.log(onGoingMatches);
	userData1.ws.send(JSON.stringify({ type: "matchFound", opponent: matchData.userId2 }));
	userData2.ws.send(JSON.stringify({ type: "matchFound", opponent: matchData.userId1 }));
}

module.exports = async function chatWebSocketRoute(fastify) {
  fastify.get('/game', { websocket: true }, (ws, request) => {
    const { token } = request.query;
    const remoteAddress = request.socket.remoteAddress;
    fastify.log.info('🟢 Game connected from ' + remoteAddress);
	const userId = userUtils.getUserIdFromToken(token);

    ws.on('message', (msg) => {
      const msgString = msg.toString();
      fastify.log.info(`📩 Message from client: ${msgString}`);

      if (msgString === "matchmaking") {
        if (!userId) {
          fastify.log.warn("⚠️ Invalid token, cannot get userId");
          ws.close(4001, "Invalid token");
          return;
        }
		const data = {
			userId: userId,
			ws: ws,
			remoteAddress: remoteAddress
		}
		if (lookingForMatch.size > 0) {
			const [otherUserId, otherData] = lookingForMatch.entries().next().value;
			lookingForMatch.delete(otherUserId);
			pairMatch(otherData, data)
		} else {
			lookingForMatch.set(userId, data);
		}
	}
	console.log(lookingForMatch)
});

    ws.on('close', (code, reason) => {
      fastify.log.info(
        `❌ WS disconnected, code: ${code}, reason: ${reason?.toString() || ''}`
      );
      // sicherstellen dass er nicht mehr in der Queue hängt
      lookingForMatch.delete(userId);
    });

    ws.on('error', (err) => {
      fastify.log.error(`⚠️ WS error: ${err.message}`);
    });
  });
};
