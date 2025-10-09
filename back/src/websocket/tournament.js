const userUtils = require('../utils/userUtil');
const requests = require('../repositories/requestRepository');
const { initMatch, createMatch } = require('../services/game/matchService');

const onGoingTournaments = new Map();
const onGoingLocalTournaments = new Map();

module.exports = async function chatWebSocketRoute(fastify) {
	fastify.get('/tournament', { websocket: true }, (ws, request) => {
		const { token } = request.query;
		const remoteAddress = request.socket.remoteAddress;

		const userId = userUtils.getUserIdFromToken(token);

		ws.on('message', (msg) => {
			const msgString = msg.toString();
			const data = JSON.parse(msgString);

			switch (data.type) {
				case "createRemoteTournament":
					deleteLocalTournament(userId);
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
					deleteRemoteTournament(userId);
					const tournamentLocal = createLocalTournament(userId, ws);
					ws.send(JSON.stringify({ type: "LocalTournamentCreated", data: getTournamentForFrontend(tournamentLocal) }));
					break;

				case "updateLocalPlayerName":
					updateLocalPlayerName(data.data.slot, data.data.name, userId, ws);
					break;
				case "ping":
					ws.send(JSON.stringify({ type: "pong" }));
					break;
				case "startTournament":
					const tournamentToStart = onGoingTournaments.get(userId);
					if (tournamentToStart && tournamentToStart.ready) {
						// const data1 = { userId : tournamentToStart.players[0].id, ws : tournamentToStart.players[0].ws }
						// const data2 = { userId : tournamentToStart.players[1].id, ws : tournamentToStart.players[0].ws }
						// const data3 = { userId : tournamentToStart.players[2].id, ws : tournamentToStart.players[0].ws }
						// const data4 = { userId : tournamentToStart.players[3].id, ws : tournamentToStart.players[0].ws }
						const p = tournamentToStart.players;
						const match1 = { id: 1, round: 0, playerLeft: p[0], playerRight: p[1], winner: null, loser: null };
						const match2 = { id: 2, round: 0, playerLeft: p[2], playerRight: p[3], winner: null, loser: null };
						createMatch({ userId: p[0].id, ws: p[0].ws }, { userId: p[1].id, ws: p[1].ws });
						createMatch({ userId: p[2].id, ws: p[2].ws }, { userId: p[3].id, ws: p[3].ws });
						for (let i = 0; i < tournamentToStart.players.length; i++) {
							const player = tournamentToStart.players[i];
							player.ws.send(JSON.stringify({ type: "tournamentStarting", data: { gameId: userId } }));
						}
						tournamentToStart.started = true;
						tournamentToStart.matches.push(match1);
						tournamentToStart.matches.push(match2);
					}
					break;
				case "roundStart": {
					const { playerLeft, playerRight } = data.data;
					const TournamentRound = findTournamentByUser(userId);
					if (TournamentRound.round === 0 && TournamentRound.roundStartMsgCounter <= 1) {
						addSystemMessage(TournamentRound, `First Round is about to start: ${playerLeft?.name || "Player1"} vs ${playerRight?.name || "Player2"}`);
						TournamentRound.roundStartMsgCounter++;
					} else if (TournamentRound.round === 1 && TournamentRound.roundStartMsgCounter <= 1) {
						addSystemMessage(TournamentRound, `Second Round is about to start: ${playerLeft?.name || "Player1"} vs ${playerRight?.name || "Player2"}`);
						TournamentRound.roundStartMsgCounter++;
					}
					broadcastTournamentUpdate(TournamentRound);
					break;
				}
				case "roundWin":
					handleRoundWin(userId, data, ws)
					break;
				default:
					console.log(`⚠️ Unknown message type received: ${data.type}`);
					break;
			}
		});

		ws.on('close', (code, reason) => {
			fastify.log.info(`❌ WebSocket closed. Code: ${code}, Reason: ${reason?.toString() || 'No reason given'}`);

			const tournament = onGoingTournaments.get(userId);
			if (tournament) {
				addSystemMessage(tournament, `Host has ended the tournament.`);
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
					fastify.log.info(`🗑️ Tournament hosted by ${userId} has been removed.`);
				}, 3000);
			} else {
				const tournament = findTournamentByUser(userId);
				if (tournament) {
					const player = tournament.players.find(p => p.id === userId);
					if (player) {
						player.status = "left";
						player.ws = null;
						addSystemMessage(tournament, `${player.username} has left the tournament.`);
						checkTournamentReady(tournament);
						broadcastTournamentUpdate(tournament);
					}
				}
			}
		});

		ws.on('error', (err) => {
			fastify.log.error(`⚠️ WebSocket error: ${err.message}`);
		});
	});
};



async function handleRoundWin(userId, data, ws) {
	console.log("──────────────────────────────────────────────");
	console.log("🎮 handleRoundWin triggered");
	console.log("UserId:", userId);
	console.log("Incoming Data:", JSON.stringify(data, null, 2));

	const { playerLeft, playerRight } = data.data;
	const tournament = findTournamentByUser(userId);
	if (!tournament) {
		console.log("❌ Tournament not found for user:", userId);
		console.log("──────────────────────────────────────────────");
		return;
	}

	// Doppelte Aufrufe vermeiden
	if (userId === playerRight.userId) {
		console.log("⚠️ Duplicate event detected (same user as right player). Ignoring.");
		console.log("──────────────────────────────────────────────");
		return;
	}

	console.log(`🏁 Current round: ${tournament.round}`);
	console.log(`🎯 Games finished so far: ${tournament.gamesFinishedCoutner}`);

	// Gewinner/Verlierer bestimmen
	const winner = playerLeft.score > playerRight.score ? playerLeft : playerRight;
	const loser = playerLeft.score > playerRight.score ? playerRight : playerLeft;

	console.log(`✅ Match finished between ${playerLeft.name} and ${playerRight.name}`);
	console.log(`🏆 Winner: ${winner.name} (${winner.score})`);
	console.log(`💀 Loser: ${loser.name} (${loser.score})`);
	// Match finden & aktualisieren
	const currentMatch = tournament.matches.find(m => {
		const leftId = m.playerLeft.userId || m.playerLeft.id;
		const rightId = m.playerRight.userId || m.playerRight.id;
		return leftId === playerLeft.userId && rightId === playerRight.userId;
	});

	if (currentMatch) {
		currentMatch.winner = winner;
		currentMatch.loser = loser;
		addSystemMessage(tournament, `Round finished! ${winner.name} won against ${loser.name} 🎉`);
		console.log("📝 Match updated:", currentMatch);
	} else {
		console.log("⚠️ No matching match found in tournament.matches for these players!");
	}

	tournament.gamesFinishedCoutner++;
	console.log(`📈 Updated gamesFinishedCoutner: ${tournament.gamesFinishedCoutner}`);
	console.log(`🔄 Current tournament state: round=${tournament.round}`);

	// ─────────────────────────────
	// Runde 0 → Halbfinale / Trostrunde
	// ─────────────────────────────
	if (tournament.round === 0 && tournament.gamesFinishedCoutner === 2) {
		console.log("🎯 All first round matches finished — proceeding to Round 1 (Semifinals).");

		tournament.round = 1;
		tournament.roundStartMsgCounter = 0;
		tournament.gamesFinishedCoutner = 0;

		const winners = tournament.matches
			.filter(m => m.round === 0)
			.map(m => m.winner)
			.filter(Boolean);

		const losers = tournament.matches
			.filter(m => m.round === 0)
			.map(m => m.loser)
			.filter(Boolean);

		console.log("✅ Winners advancing:", winners.map(w => w.name));
		console.log("💀 Losers advancing to consolation:", losers.map(l => l.name));

		// Gewinner-Match
		if (winners.length >= 2) {
			console.log("⚔️ Creating winners match...");
			const player1 = tournament.players.find(p => p.id === winners[0].userId);
			const player2 = tournament.players.find(p => p.id === winners[1].userId);
			const matchWinners = {
				id: 3,
				round: 1,
				playerLeft: winners[0],
				playerRight: winners[1],
				winner: null,
				loser: null,
				isConsolation: false
			};
			tournament.matches.push(matchWinners);
			console.log("🆕 Added winners match:", matchWinners);
			await createMatch({ userId: player1.id, ws: player1.ws }, { userId: player2.id, ws: player2.ws });
			addSystemMessage(tournament, `Next match: ${winners[0].name} vs ${winners[1].name}`);
			player1.ws.send(JSON.stringify({ type: "startSecondRound" }));
			player2.ws.send(JSON.stringify({ type: "startSecondRound" }));
		}

		// Trostrunden-Match
		if (losers.length >= 2) {
			console.log("⚔️ Creating consolation match...");
			const player1 = tournament.players.find(p => p.id === losers[0].userId);
			const player2 = tournament.players.find(p => p.id === losers[1].userId);
			const matchLosers = {
				id: 4,
				round: 1,
				playerLeft: losers[0],
				playerRight: losers[1],
				winner: null,
				loser: null,
				isConsolation: true
			};
			tournament.matches.push(matchLosers);
			console.log("🆕 Added losers match:", matchLosers);
			await createMatch({ userId: player1.id, ws: player1.ws }, { userId: player2.id, ws: player2.ws });
			addSystemMessage(tournament, `Consolation match: ${losers[0].name} vs ${losers[1].name}`);
			player1.ws.send(JSON.stringify({ type: "startSecondRound" }));
			player2.ws.send(JSON.stringify({ type: "startSecondRound" }));
		}

		console.log("🏁 Round 1 setup complete.");
	}

	// ─────────────────────────────
	// Runde 1 → Turnierabschluss
	// ─────────────────────────────
	else if (tournament.round === 1 && tournament.gamesFinishedCoutner === 2) {
		console.log("🎯 All second round matches finished — proceeding to Tournament Final!");
		tournament.round = 2;
		addSystemMessage(tournament, "🏁 Tournament finished! Calculating final results...");

		const finalMatch = tournament.matches.find(m => m.round === 1 && !m.isConsolation);
		const consolationMatch = tournament.matches.find(m => m.round === 1 && m.isConsolation);

		const first = finalMatch?.winner;
		const second = finalMatch?.loser;
		const third = consolationMatch?.winner;
		const fourth = consolationMatch?.loser;

		addSystemMessage(tournament, `🥇 1st Place: ${first?.name || "Player"}`);
		addSystemMessage(tournament, `🥈 2nd Place: ${second?.name || "Player"}`);
		addSystemMessage(tournament, `🥉 3rd Place: ${third?.name || "Player"}`);
		if (fourth) addSystemMessage(tournament, `4th Place: ${fourth.name}`);

		console.log("🏁 Final standings calculated:");
		console.table([
			{ Place: 1, Player: first?.name },
			{ Place: 2, Player: second?.name },
			{ Place: 3, Player: third?.name },
			{ Place: 4, Player: fourth?.name }
		]);

		// Ergebnisse an alle Spieler senden
		tournament.players.forEach(p => {
			if (p.ws) {
				p.ws.send(JSON.stringify({
					type: "tournamentFinished",
					data: {
						results: [
							{ place: 1, player: first },
							{ place: 2, player: second },
							{ place: 3, player: third },
							{ place: 4, player: fourth }
						].filter(Boolean)
					}
				}));
			}
		});

		console.log("📢 Tournament results broadcasted to all players.");
	}

	console.log("📡 Broadcasting tournament update...");
	broadcastTournamentUpdate(tournament);
	console.log("✅ handleRoundWin completed for user:", userId);
	console.log("──────────────────────────────────────────────");
}


function deleteRemoteTournament(userId) {
	const tournamentRemote = onGoingTournaments.get(userId);
	if (tournamentRemote) {
		addSystemMessage(tournamentRemote, `Host has ended the tournament.`);
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
		}, 3000);
	}
}

function deleteLocalTournament(userId) {
	const tournamentLocal = onGoingLocalTournaments.get(userId);
	if (tournamentLocal) {
		onGoingLocalTournaments.delete(userId);
	}
}

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
		messages: tournament.messages,
		ready: tournament.ready || false
	};
}

function checkTournamentReady(tournament) {
	const allJoined = tournament.players.every(p => p.status === "joined");
	tournament.ready = allJoined;
	if (allJoined) {
		addSystemMessage(tournament, "✅ All players joined. Tournament is ready to start!");
	} else {
		addSystemMessage(tournament, "⚠️ Tournament is no longer ready.");
	}
	broadcastTournamentUpdate(tournament);
}


function createRemoteTournament(hostId, ws) {
	const user = userUtils.getUser(hostId);
	const tournament = {
		players: [
			{ id: hostId, username: user.username, path: user.path, slot: 1, status: "joined", ws: ws },
			{ id: null, username: null, path: null, slot: 2, status: null, ws: null },
			{ id: null, username: null, path: null, slot: 3, status: null, ws: null },
			{ id: null, username: null, path: null, slot: 4, status: null, ws: null },
		],
		messages: [],
		matches: [],
		ready: false,
		started : false,
		round : 0,
		roundStartMsgCounter : 0,
		gamesFinishedCoutner : 0,
	};
	onGoingTournaments.set(hostId, tournament);
	return tournament;
}

function createLocalTournament(hostId, ws) {
	const user = userUtils.getUser(hostId);
	const tournament = {
		players: [
			{ id: hostId, username: user.username, path: user.path, slot: 1, status: "joined", ws: ws },
			{ id: null, username: "Player 2", slot: 2, status: "joined", path: null },
			{ id: null, username: "Player 3", slot: 3, status: "joined", path: null },
			{ id: null, username: "Player 4", slot: 4, status: "joined", path: null },
		],
		messages: []
	};
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
	if (!tournament) return null;
	let player = null;
	if (slot === 2) player = tournament.players[1];
	else if (slot === 3) player = tournament.players[2];
	else if (slot === 4) player = tournament.players[3];

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
	if (!tournament) return null;
	for (let i = 0; i < tournament.players.length; i++) {
		const player = tournament.players[i];
		if (player.id === userId && player.status === "invited") {
			player.status = "joined";
			player.ws = ws;
			addSystemMessage(tournament, `${player.username} joined the tournament.`);
			checkTournamentReady(tournament);
			return tournament;
		}
	}
}

function broadcastTournamentUpdate(tournament) {
	if (!tournament) return;
	tournament.players.forEach(player => {
		if (player.ws) {
			player.ws.send(JSON.stringify({ type: "remoteTournamentUpdated", data: getTournamentForFrontend(tournament) }));
		}
	});
}
