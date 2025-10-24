const tournamentUtils = require("./utils");
const { createMatch } = require("../game/matchService");
const { createTournamenHistory, getRecentMatches } = require("../../repositories/tournamentMatchHistoryRepository");

async function handleRoundWin(userId, data) {
	const tournament = tournamentUtils.findTournamentByUser(userId);
	if (!tournament) return;

	const { playerLeft, playerRight } = data.data;

	if (userId === playerRight.userId) return;

	const { winner, loser } = determineWinner(playerLeft, playerRight);
	const currentMatch = findCurrentMatch(tournament, playerLeft, playerRight);

	if (!currentMatch) {
		console.warn("⚠️ No matching match found in tournament.matches for these players!");
		return;
	}

	updateMatch(tournament, currentMatch, winner, loser);
	tournament.gamesFinishedCoutner++;

	if (tournament.round === 0 && tournament.gamesFinishedCoutner === 2) {
		await startNextRound(tournament);
	} else if (tournament.round === 1 && tournament.gamesFinishedCoutner === 2) {
		await finishTournament(tournament);
	}

	tournamentUtils.broadcastTournamentUpdate(tournament);
}

function determineWinner(playerLeft, playerRight) {
	const winner = playerLeft.score > playerRight.score ? playerLeft : playerRight;
	const loser = playerLeft.score > playerRight.score ? playerRight : playerLeft;
	return { winner, loser };
}

function findCurrentMatch(tournament, playerLeft, playerRight) {
	return tournament.matches.find(m => {
		const leftId = m.playerLeft.userId || m.playerLeft.id;
		const rightId = m.playerRight.userId || m.playerRight.id;
		return leftId === playerLeft.userId && rightId === playerRight.userId;
	});
}

function updateMatch(tournament, match, winner, loser) {
	match.winner = winner;
	match.loser = loser;
	tournamentUtils.addSystemMessage(tournament, `Round finished! ${winner.name} won against ${loser.name} 🎉`);
}

async function startNextRound(tournament) {
	tournament.round = 1;
	tournament.roundStartMsgCounter = 0;
	tournament.gamesFinishedCoutner = 0;

	const winners = tournament.matches.filter(m => m.round === 0).map(m => m.winner).filter(Boolean);
	const losers = tournament.matches.filter(m => m.round === 0).map(m => m.loser).filter(Boolean);

	await createRoundMatches(tournament, winners, false);
	await createRoundMatches(tournament, losers, true);
}

async function createRoundMatches(tournament, players, isConsolation) {
	if (players.length < 2) return;

	const player1 = tournament.players.find(p => p.id === players[0].userId);
	const player2 = tournament.players.find(p => p.id === players[1].userId);

	const match = {
		id: generateMatchId(tournament),
		round: tournament.round,
		playerLeft: players[0],
		playerRight: players[1],
		winner: null,
		loser: null,
		isConsolation
	};

	tournament.matches.push(match);
	await createMatch({ userId: player1.id, ws: player1.ws }, { userId: player2.id, ws: player2.ws });

	tournamentUtils.addSystemMessage(tournament, `${isConsolation ? "Consolation match" : "Next match"}: ${players[0].name} vs ${players[1].name}`);

	player1.ws.send(JSON.stringify({ type: "firstRoundFinished" }));
	player2.ws.send(JSON.stringify({ type: "firstRoundFinished" }));

	setTimeout(() => {
		player1.ws.send(JSON.stringify({ type: "startSecondRound" }));
		player2.ws.send(JSON.stringify({ type: "startSecondRound" }));
	}, 10000)
}


async function finishTournament(tournament) {
	console.log("🏁 [DEBUG] finishTournament() called with tournament:", {
		id: tournament?.id,
		name: tournament?.name,
		matches: tournament?.matches?.length,
		players: tournament?.players?.length
	});

	try {
		console.log("🔄 Setting tournament.round = 2");
		tournament.round = 2;

		console.log("🧠 Adding system message: Tournament finished");
		tournamentUtils.addSystemMessage(tournament, "🏁 Tournament finished! Calculating final results...");

		// Find final and consolation matches
		const finalMatch = tournament.matches.find(m => m.round === 1 && !m.isConsolation);
		const consolationMatch = tournament.matches.find(m => m.round === 1 && m.isConsolation);

		console.log("🔍 Found matches:", {
			finalMatch: finalMatch ? { id: finalMatch.id, winner: finalMatch.winner?.name, loser: finalMatch.loser?.name } : "❌ None",
			consolationMatch: consolationMatch ? { id: consolationMatch.id, winner: consolationMatch.winner?.name, loser: consolationMatch.loser?.name } : "❌ None"
		});

		// Compute results
		const results = [
			finalMatch?.winner,
			finalMatch?.loser,
			consolationMatch?.winner,
			consolationMatch?.loser
		].filter(Boolean);

		console.log("🏆 Results computed:", results.map(r => r.name));

		results.forEach((player, index) => {
			const msg = `🥇${index + 1} Place: ${player.name}`;
			console.log("💬 Adding system message:", msg);
			tournamentUtils.addSystemMessage(tournament, msg);
		});

		// Notify all players
		console.log("📡 Broadcasting 'tournamentFinished' to players...");
		tournament.players.forEach(p => {
			if (!p.ws) {
				console.log(`⚠️ Player ${p.name || p.id} has no active websocket`);
				return;
			}
			const payload = {
				type: "tournamentFinished",
				data: { results: results.map((r, i) => ({ place: i + 1, player: r })) }
			};
			console.log(`➡️ Sending to ${p.name || p.id}:`, JSON.stringify(payload, null, 2));
			p.ws.send(JSON.stringify(payload));
		});

		// Save to database
		console.log("💾 Calling createTournamenHistory()...");
		const tournamentId = await createTournamenHistory(tournament);
		console.log(`✅ Tournament history created: ID = ${tournamentId}`);

		const playerIds = tournament.players
			.filter(p => !!p.id)
			.map(p => p.id);
		console.log("👥 Player IDs to update matches for:", playerIds);

		// Update recent matches for each player
		for (const playerId of playerIds) {
			console.log(`🔁 Processing player ${playerId}...`);
			const recentMatches = getRecentMatches(playerId);
			console.log(`📊 Found ${recentMatches.length} recent matches for player ${playerId}`);

			for (let i = 0; i < recentMatches.length; i++) {
				const match = recentMatches[i];
				const round = i === 0 ? 2 : 1;
				console.log(`📝 Updating match ${match.id} (round ${round}) → tournament ${tournamentId}`);

				try {
					await updateMatch(tournamentId, round, match.id);
					console.log(`✅ Successfully updated match ${match.id}`);
				} catch (err) {
					console.error(`❌ Failed to update match ${match.id}:`, err.message);
				}
			}
		}

		console.log(`🎉 Tournament #${tournamentId} saved and linked successfully!`);
	} catch (err) {
		console.error("🔥 [ERROR] Uncaught error in finishTournament():", err);
	}
}


function generateMatchId(tournament) {
	return tournament.matches.length + 1;
}

async function roundWin(userId, ws, data) {
	handleRoundWin(userId, { data }, ws);
}

module.exports = {
	roundWin
}
