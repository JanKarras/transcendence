const tournamentUtils = require("./utils");
const { createMatch } = require("../game/matchService");
const { createTournamentHistory, getRecentMatches, updateMatchRep } = require("../../repositories/tournamentMatchHistoryRepository");
const { incrementTournamentWins } = require("../../repositories/statsRepository");

async function handleRoundWin(userId, data) {
	console.log("🎯 [RoundWin] Triggered by userId:", userId);
	if (!data || !data.data) {
		console.error("❌ [RoundWin] Invalid data payload:", data);
		return;
	}

	const tournament = tournamentUtils.findTournamentByUser(userId);
	if (!tournament) {
		console.error("❌ [RoundWin] No tournament found for user:", userId);
		return;
	}

	// 🧠 Log Überblick über alle Spieler im Turnier
	console.log("👥 [RoundWin] tournament.players snapshot:");
	tournament.players.forEach(p =>
		console.log(`   - ${p.username || "(no name)"} (id=${p.id || p.userId}, ws=${!!p.ws})`)
	);

	const { playerLeft, playerRight } = data.data;
	console.log("🏓 [RoundWin] Players in data:", {
		playerLeft: playerLeft?.userId,
		playerRight: playerRight?.userId
	});

	if (userId === playerRight.userId) {
		console.log("↩️ [RoundWin] Ignoring duplicate call from right-side player:", userId);
		return;
	}

	const { winner, loser } = determineWinner(playerLeft, playerRight);
	console.log(`🏆 [RoundWin] Determined winner=${winner.name}, loser=${loser.name}`);

	const currentMatch = findCurrentMatch(tournament, playerLeft, playerRight);
	if (!currentMatch) {
		console.warn("⚠️ [RoundWin] No matching match found in tournament.matches!");
		console.log("📋 [RoundWin] Tournament matches snapshot:", tournament.matches);
		return;
	}

	updateMatch(tournament, currentMatch, winner, loser);

	tournament.gamesFinishedCoutner = (tournament.gamesFinishedCoutner || 0) + 1;
	console.log(`📈 [RoundWin] Tournament now has ${tournament.gamesFinishedCoutner} finished games in round ${tournament.round}`);

	try {
		if (tournament.round === 0 && tournament.gamesFinishedCoutner === 2) {
			console.log("🔄 [RoundWin] All games in round 0 finished — starting next round...");
			await startNextRound(tournament);
		} else if (tournament.round === 1 && tournament.gamesFinishedCoutner === 2) {
			console.log("🏁 [RoundWin] All games in round 1 finished — finishing tournament...");
			await finishTournament(tournament);
		} else {
			console.log("🕓 [RoundWin] Waiting for more games to finish in this round.");
		}
	} catch (err) {
		console.error("🔥 [RoundWin] Error while handling round transition:", err);
	}

	try {
		tournamentUtils.broadcastTournamentUpdate(tournament);
		console.log("📡 [RoundWin] Tournament update broadcasted successfully.");
	} catch (err) {
		console.error("❌ [RoundWin] Failed to broadcast tournament update:", err);
	}
}

function determineWinner(playerLeft, playerRight) {
	if (!playerLeft || !playerRight) {
		console.error("❌ [determineWinner] Missing player data:", { playerLeft, playerRight });
		return { winner: null, loser: null };
	}
	const winner = playerLeft.score > playerRight.score ? playerLeft : playerRight;
	const loser = playerLeft.score > playerRight.score ? playerRight : playerLeft;
	return { winner, loser };
}

function findCurrentMatch(tournament, playerLeft, playerRight) {
	if (!tournament?.matches) {
		console.error("❌ [findCurrentMatch] tournament.matches missing!");
		return null;
	}
	return tournament.matches.find(m => {
		const leftId = m.playerLeft.userId || m.playerLeft.id;
		const rightId = m.playerRight.userId || m.playerRight.id;
		return leftId === playerLeft.userId && rightId === playerRight.userId;
	});
}

function updateMatch(tournament, match, winner, loser) {
	console.log(`🧩 [updateMatch] Updating match ${match.id}: ${winner.name} beat ${loser.name}`);
	match.winner = winner;
	match.loser = loser;

	try {
		tournamentUtils.addSystemMessage(tournament, "tournament.roundFinished", {
			winner: winner.name,
			loser: loser.name
		});
		console.log("📢 [updateMatch] Added roundFinished system message.");
	} catch (err) {
		console.error("❌ [updateMatch] Failed to add system message:", err);
	}
}

async function startNextRound(tournament) {
	console.log(`🚀 [RoundStart] Starting next round for tournament ${tournament.id || "(no id)"}`);
	tournament.round = 1;
	tournament.roundStartMsgCounter = 0;
	tournament.gamesFinishedCoutner = 0;

	const winners = tournament.matches.filter(m => m.round === 0).map(m => m.winner).filter(Boolean);
	const losers = tournament.matches.filter(m => m.round === 0).map(m => m.loser).filter(Boolean);

	console.log("🏆 [RoundStart] Winners:", winners.map(w => w.name));
	console.log("💀 [RoundStart] Losers:", losers.map(l => l.name));

	await createRoundMatches(tournament, winners, false);
	await createRoundMatches(tournament, losers, true);
}

async function createRoundMatches(tournament, players, isConsolation) {
	if (players.length < 2) {
		console.warn("⚠️ [createRoundMatches] Not enough players to create a match:", players);
		return;
	}

	console.log(`🎮 [createRoundMatches] Creating ${isConsolation ? "Consolation" : "Final"} match with:`, players.map(p => p.name));

	// 🧠 Immer echte Spielerobjekte aus tournament.players verwenden
	const player1 = tournament.players.find(p => p.id === players[0].userId || p.userId === players[0].userId);
	const player2 = tournament.players.find(p => p.id === players[1].userId || p.userId === players[1].userId);

	console.log("👀 [createRoundMatches] Found in tournament.players:", {
		player1: player1 ? `${player1.name} (ws=${!!player1.ws})` : null,
		player2: player2 ? `${player2.name} (ws=${!!player2.ws})` : null
	});

	if (!player1 || !player2) {
		console.error("❌ [createRoundMatches] Could not find player objects in tournament.players!");
		return;
	}

	const match = {
		id: generateMatchId(tournament),
		round: tournament.round,
		playerLeft: player1, // echte Referenz
		playerRight: player2, // echte Referenz
		winner: null,
		loser: null,
		isConsolation
	};

	tournament.matches.push(match);
	console.log(`🧾 [createRoundMatches] Added match id=${match.id}, round=${match.round}`);

	try {
		await createMatch({ userId: player1.id, ws: player1.ws }, { userId: player2.id, ws: player2.ws });
		console.log(`✅ [createRoundMatches] Match creation triggered for ${player1.name} vs ${player2.name}`);
	} catch (err) {
		console.error("❌ [createRoundMatches] Failed to create match:", err);
	}

	try {
		tournamentUtils.addSystemMessage(
			tournament,
			isConsolation ? "tournament.consolationMatch" : "tournament.nextMatch",
			{ player1: player1.name, player2: player2.name }
		);
		console.log("📢 [createRoundMatches] Added system message for new match.");
	} catch (err) {
		console.error("⚠️ [createRoundMatches] Failed to add system message:", err);
	}

	try {
		player1.ws?.send(JSON.stringify({ type: "startSecondRound" }));
		player2.ws?.send(JSON.stringify({ type: "startSecondRound" }));
		console.log(`📡 [createRoundMatches] Sent startSecondRound to ${player1.name} and ${player2.name}`);
	} catch (err) {
		console.error("❌ [createRoundMatches] Failed to send startSecondRound:", err);
	}
}

async function finishTournament(tournament) {
	console.log(`🏁 [TournamentFinish] Starting finish for tournament ${tournament.id || "(no id)"}`);
	console.log("👥 [TournamentFinish] tournament.players snapshot:");
	tournament.players.forEach(p =>
		console.log(`   - ${p.username || "(no name)"} (id=${p.id || p.userId}, ws=${!!p.ws})`)
	);

	try {
		tournament.round = 2;
		tournamentUtils.addSystemMessage(tournament, "tournament.finished");
		console.log("📢 [TournamentFinish] Added tournament.finished message.");

		const finalMatch = tournament.matches.find(m => m.round === 1 && !m.isConsolation);
		const consolationMatch = tournament.matches.find(m => m.round === 1 && m.isConsolation);
		console.log("🏆 [TournamentFinish] finalMatch:", finalMatch);
		console.log("🏆 [TournamentFinish] consolationMatch:", consolationMatch);

		const results = [
			finalMatch?.winner,
			finalMatch?.loser,
			consolationMatch?.winner,
			consolationMatch?.loser
		].filter(Boolean);
		console.log("📊 [TournamentFinish] Results:", results.map(r => r.name));

		const firstPlace = results[0];
		if (firstPlace && (firstPlace.id || firstPlace.userId)) {
			const userId = firstPlace.id || firstPlace.userId;
			try {
				await incrementTournamentWins(userId);
				console.log(`✅ [TournamentFinish] Incremented tournamentWins for ${userId}`);
			} catch (err) {
				console.error(`⚠️ [TournamentFinish] Failed to increment tournamentWins for ${userId}:`, err);
			}
		} else {
			console.warn("⚠️ [TournamentFinish] No first-place player found!");
		}

		results.forEach((player, index) => {
			tournamentUtils.addSystemMessage(
				tournament,
				"tournament.placeResult",
				{ place: (index + 1).toString(), username: player.name }
			);
		});

		for (const p of tournament.players) {
			if (!p.ws) {
				console.warn(`⚠️ [TournamentFinish] Player ${p.name || p.id} has no WebSocket, skipping send.`);
				continue;
			}
			const payload = {
				type: "tournamentFinished",
				data: { results: results.map((r, i) => ({ place: i + 1, player: r })) }
			};
			try {
				p.ws.send(JSON.stringify(payload));
				console.log(`📨 [TournamentFinish] Sent tournamentFinished to ${p.name}`);
			} catch (err) {
				console.error(`❌ [TournamentFinish] Failed to send to ${p.name}:`, err);
			}
		}

		const tournamentId = await createTournamentHistory(tournament);
		console.log(`🗂️ [TournamentFinish] Tournament history created with ID ${tournamentId}`);

		const playerIds = tournament.players.filter(p => !!p.id).map(p => p.id);
		console.log("👥 [TournamentFinish] Player IDs:", playerIds);

		for (const playerId of playerIds) {
			const recentMatches = await getRecentMatches(playerId);
			for (let i = 0; i < recentMatches.length; i++) {
				const match = recentMatches[i];
				const round = i === 0 ? 2 : 1;
				try {
					await updateMatchRep(tournamentId, round, match.id);
					console.log(`✅ [TournamentFinish] Updated match ${match.id} (round ${round})`);
				} catch (err) {
					console.error(`❌ [TournamentFinish] Failed to update match ${match.id}:`, err);
				}
			}
		}
		console.log("🎉 [TournamentFinish] Tournament finished successfully!");
	} catch (err) {
		console.error("🔥 [TournamentFinish] Uncaught error:", err);
	}
}

function generateMatchId(tournament) {
	return tournament.matches.length + 1;
}

async function roundWin(userId, ws, data) {
	console.log("⚡ [RoundWin] Received roundWin WS event from", userId);
	await handleRoundWin(userId, { data }, ws);
}

module.exports = { roundWin };
