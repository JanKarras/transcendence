const userUtils = require('../utils/userUtil');
const requests = require('../repositories/requestRepository');

const onGoingTournaments = new Map();
const onGoingLocalTournaments = new Map();

module.exports = async function chatWebSocketRoute(fastify) {
	fastify.get('/tournament', { websocket: true }, (ws, request) => {
		const { token } = request.query;
		const remoteAddress = request.socket.remoteAddress;
		console.log(`🌐 New WS connection from ${remoteAddress}, token: ${token}`);
		console.log("Token to call getUserIdFromToken:", token);
		const userId = userUtils.getUserIdFromToken(token);
		console.log(`User ID from token: ${userId}`);
		ws.on('message', (msg) => {
			const msgString = msg.toString();
			const data = JSON.parse(msgString);
			console.log(`📩 WS message from user ${userId}:`, data);

			switch (data.type) {
				case "createRemoteTournament":
					const tournament = createRemoteTournament(userId, ws);
					ws.send(JSON.stringify({ type: "tournamentCreated", data: getTournamentForFrontend(tournament) }));
					break;
				case "inviteToTournament":
					const tournamentData = inviteToTournament(userId, data.data.guestId, data.data.slot);
					broadcastTournamentUpdate(tournamentData);
					break;
				case "joinGame":
					const tournamentToJoinData = joinTiournament(data.data.gameId, userId, ws);
					broadcastTournamentUpdate(tournamentToJoinData);
					break;
				case "tournamentChat":
					const tournamentChat = findTournamentByUser(userId);
					if (tournamentChat) {
						const user = userUtils.getUser(userId);
						addUserMessage(tournamentChat, user.username, data.data.message);
						broadcastTournamentUpdate(tournamentChat);
					}
					break;
				case "createLocalTournament":
					const tournamentRemote = onGoingTournaments.get(userId);
					if (tournamentRemote) {
						addSystemMessage(tournamentRemote, `Host has left the tournament. Tournament ended.`);
						broadcastTournamentUpdate(tournamentRemote);

						setTimeout(() => {
							for (let i = 1; i < tournamentRemote.players.length; i++) {
								const players = tournamentRemote.players[i];
								if (players.ws && players.ws.readyState === players.ws.OPEN) {
									players.ws.send(JSON.stringify({ type: "endTournament", data: { message: "Tournament ended by host." } }));
									players.ws.close();
								}
							}
  							onGoingTournaments.delete(userId);
  							fastify.log.info(`Tournament ${userId} deleted.`);
  						}, 3000);
					}
					const tournamentLocal = createLocalTournament(userId, ws);
					ws.send(JSON.stringify({ type: "LocalTournamentCreated", data: getTournamentForFrontend(tournamentLocal) }));
					break;
				case "updateLocalPlayerName" :
					updateLocalPlayerName(data.data.slot, data.data.name, userId, ws);
					break
				default:
					break;
			}
		});

		ws.on('close', (code, reason) => {
			fastify.log.info(
				`❌ WS disconnected, code: ${code}, reason: ${reason?.toString() || ''}`
			);
			const tournament = onGoingTournaments.get(userId);
			if (tournament) {
				addSystemMessage(tournament, `Host has left the tournament. Tournament ended.`);
				broadcastTournamentUpdate(tournament);

				setTimeout(() => {
  					tournament.players.forEach(p => {
  					  if (p.ws) {
  					    p.ws.send(JSON.stringify({ type: "endTournament", data: { message: "Tournament ended by host." } }));
  					  }
  					});
  					tournament.players.forEach(p => {
  					  if (p.ws && p.ws.readyState === p.ws.OPEN) {
  					    p.ws.close();
  					}
  					});
  					onGoingTournaments.delete(userId);
  					fastify.log.info(`Tournament ${userId} deleted.`);
  				}, 3000);
			} else {
				const tournament = findTournamentByUser(userId);
				if (tournament) {
					const player = tournament.players.find(p => p.id === userId);
					if (player) {
						player.status = "left";
						player.ws = null;
						addSystemMessage(tournament, `${player.username} has left the tournament.`);
						broadcastTournamentUpdate(tournament);
					}
				}
			}
		});

		ws.on('error', (err) => {
			fastify.log.error(`⚠️ WS error: ${err.message}`);
		});
	});
};

function updateLocalPlayerName(slot, name, hostId, ws) {
	const tournament = onGoingLocalTournaments.get(hostId);
	if (tournament) {
		const player = tournament.players.find(p => p.slot === slot);
		if (player) {
			player.username = name;
		}
		ws.send(JSON.stringify({ type: "localTournamentUpdated", data: getTournamentForFrontend(tournament) }));
	}
}

function findTournamentByUser(userId) {
    for (const t of onGoingTournaments.values()) {
        if (t.players.some(p => p.id === userId)) return t;
    }
    return null;
}


function getTournamentForFrontend(tournament) {
    return {
        players: tournament.players.map(p => ({
            id: p.id,
            username: p.username,
            path: p.path,
            slot: p.slot,
            status: p.status
        })),
        messages: tournament.messages // <-- auch mitschicken
    };
}



function createRemoteTournament(hostId, ws) {
    const user = userUtils.getUser(hostId);
    const tournament = {
        players: [
            {
                id: hostId,
                username: user.username,
                path: user.path,
                slot: 1,
                status: "joined",
				ws: ws
            },
            {
				id: null,
                username: null,
                path: null,
                slot: 2,
                status: null,
				ws: null
			},
			{
				id: null,
                username: null,
                path: null,
                slot: 3,
                status: null,
				ws: null
			},
			{
				id: null,
                username: null,
                path: null,
                slot: 4,
                status: null,
				ws: null
			},
        ],
		messages: []
    };
    onGoingTournaments.set(hostId, tournament);
    return tournament;
}

function createLocalTournament(hostId, ws) {
	const user = userUtils.getUser(hostId);
	const tournament = {
		players: [
			{
				id: hostId,
				username: user.username,
				path: user.path,
				slot: 1,
				status: "joined",
				ws: ws
			},
			{
				id: null,
				username: "Player 2",
				slot: 2,
				status: "joined",
				path: null
			},
			{
				id: null,
				username: "Player 3",
				slot: 3,
				status: "joined",
				path: null
			},
			{
				id: null,
				username: "Player 4",
				slot: 4,
				status: "joined",
				path: null
			},
		],
		messages: []
	}
	onGoingLocalTournaments.set(hostId, tournament);
	return tournament;
}

function addSystemMessage(tournament, text) {
    tournament.messages.push({ type: "system", text });
}

function addUserMessage(tournament, username, text) {
    tournament.messages.push({ type: "user", text: `${username}: ${text}` });
}

function inviteToTournament(hostId, guestId, slot) {
	const user = userUtils.getUser(guestId);

	const tournament = onGoingTournaments.get(hostId);
	let player = null;
	if (slot === 2) {
		player = tournament.players[1];
	} else if (slot === 3) {
		player = tournament.players[2];
	} else if (slot === 4) {
		player = tournament.players[3];
	}
	player.id = guestId;
	player.username = user.username;
	player.path = user.path;
	player.status = "invited";


	addSystemMessage(tournament, `${user.username} has been invited.`);
	requests.addTournamentRequest(hostId, guestId);

	return tournament;
}

function joinTiournament(gameId, userId, ws) {
	const tournament = onGoingTournaments.get(gameId);
	for (let i = 0; i < tournament.players.length; i++) {
		const player = tournament.players[i];
		if (player.id === userId && player.status === "invited") {
			player.status = "joined";
			player.ws = ws;
			addSystemMessage(tournament, `${player.username} joined the tournament.`);
			return tournament;
		}
	}
}

function broadcastTournamentUpdate(tournament) {
	tournament.players.forEach(player => {
		if (player.ws) {
			player.ws.send(JSON.stringify({ type: "remoteTournamentUpdated", data: getTournamentForFrontend(tournament) }));
		}
	});
}
