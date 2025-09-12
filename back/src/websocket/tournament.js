const userUtils = require('../utils/userUtil');
const onGoingTournaments = []

module.exports = async function chatWebSocketRoute(fastify) {
	fastify.get('/tournament', { websocket: true }, (ws, request) => {
		const { token } = request.query;
		const remoteAddress = request.socket.remoteAddress;
		console.log(`🌐 New WS connection from ${remoteAddress}, token: ${token}`);
		const userId = userUtils.getUserIdFromToken(token);

		ws.on('message', (msg) => {
			const msgString = msg.toString();
			const data = JSON.parse(msgString);
			console.log(`📩 WS message from user ${userId}:`, data);
			switch (data.type) {
				case "createLocalTournament":
					createLocalTournament(userId, ws, data.data)
					break;
				case "getData":
					sendData(ws, userId);
					break;
				default:
					break;
			}
		});

		ws.on('close', (code, reason) => {
			fastify.log.info(
				`❌ WS disconnected, code: ${code}, reason: ${reason?.toString() || ''}`
			);
		});

		ws.on('error', (err) => {
			fastify.log.error(`⚠️ WS error: ${err.message}`);
		});
	});
};

function createLocalTournament(userId, ws, data) {
	const user = userUtils.getUser(userId);
	const tournament = {
		id : userId,
		path : user.path,
		player1: data.player1,
		player2: data.player2,
		player3: data.player3,
		player4: data.player4,
	}
	onGoingTournaments.push(tournament);
}

function sendData(ws, userId) {
	for (let i = 0; i < onGoingTournaments.length; i++) {
		const tournament = onGoingTournaments[i];
		if (tournament.id === userId) {
			ws.send(JSON.stringify({ type: "tournamentData", data: tournament }) );
			console.log("Sent tournament data to user:", userId);
			return;
		}
	}
}
