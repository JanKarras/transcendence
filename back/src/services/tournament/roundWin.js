const tournamentUtils = require("./utils");
const { createMatch } = require("../game/matchService");
const { createTournamentHistory, getRecentMatches, updateMatchRep } = require("../../repositories/tournamentMatchHistoryRepository");
const { incrementTournamentWins } = require("../../repositories/statsRepository");

async function handleRoundWin(userId, data) {
	if (!data || !data.data) return;

	const tournament = tournamentUtils.findTournamentByUser(userId);
	if (!tournament) return;

	const { playerLeft, playerRight } = data.data;
	if (userId === playerRight.userId) return;

	const { winner, loser } = determineWinner(playerLeft, playerRight);
	const currentMatch = findCurrentMatch(tournament, playerLeft, playerRight);
	if (!currentMatch) return;

	updateMatch(tournament, currentMatch, winner, loser);
	tournament.gamesFinishedCoutner = (tournament.gamesFinishedCoutner || 0) + 1;

	try {
		if (tournament.round === 0 && tournament.gamesFinishedCoutner === 2) {
			await startNextRound(tournament);
		} else if (tournament.round === 1 && tournament.gamesFinishedCoutner === 2) {
			await finishTournament(tournament);
		}
	} catch {}

	try {
		tournamentUtils.broadcastTournamentUpdate(tournament);
	} catch {}
}

function determineWinner(playerLeft, playerRight) {
	if (!playerLeft || !playerRight) return { winner: null, loser: null };
	const winner = playerLeft.score > playerRight.score ? playerLeft : playerRight;
	const loser = playerLeft.score > playerRight.score ? playerRight : playerLeft;
	return { winner, loser };
}

function findCurrentMatch(tournament, playerLeft, playerRight) {
	if (!tournament?.matches) return null;
	return tournament.matches.find(m => {
		const leftId = m.playerLeft.userId || m.playerLeft.id;
		const rightId = m.playerRight.userId || m.playerRight.id;
		return leftId === playerLeft.userId && rightId === playerRight.userId;
	});
}

function updateMatch(tournament, match, winner, loser) {
	match.winner = winner;
	match.loser = loser;
	try {
		tournamentUtils.addSystemMessage(tournament, "tournament.roundFinished", {
			winner: winner.alias,
			loser: loser.alias
		});
	} catch {}
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

	const player1 = tournament.players.find(p => p.id === players[0].userId || p.userId === players[0].userId);
	const player2 = tournament.players.find(p => p.id === players[1].userId || p.userId === players[1].userId);

	if (!player1 || !player2) return;

	const match = {
		id: generateMatchId(tournament),
		round: tournament.round,
		playerLeft: player1,
		playerRight: player2,
		winner: null,
		loser: null,
		isConsolation
	};

	tournament.matches.push(match);

	try {
		await createMatch({ userId: player1.id, ws: player1.ws }, { userId: player2.id, ws: player2.ws });
	} catch {}

	try {
		tournamentUtils.addSystemMessage(
			tournament,
			isConsolation ? "tournament.consolationMatch" : "tournament.nextMatch",
			{ player1: player1.alias, player2: player2.alias }
		);
	} catch {}

	try {
		player1.ws?.send(JSON.stringify({ type: "startSecondRound" }));
		player2.ws?.send(JSON.stringify({ type: "startSecondRound" }));
	} catch {}
}

async function finishTournament(tournament) {
	try {
		tournament.round = 2;
		tournamentUtils.addSystemMessage(tournament, "tournament.finished");

		const finalMatch = tournament.matches.find(m => m.round === 1 && !m.isConsolation);
		const consolationMatch = tournament.matches.find(m => m.round === 1 && m.isConsolation);

		const results = [
			finalMatch?.winner,
			finalMatch?.loser,
			consolationMatch?.winner,
			consolationMatch?.loser
		].filter(Boolean);

		const firstPlace = results[0];
		if (firstPlace && (firstPlace.id || firstPlace.userId)) {
			const userId = firstPlace.id || firstPlace.userId;
			try {
				await incrementTournamentWins(userId);
			} catch {}
		}

		results.forEach((player, index) => {
			tournamentUtils.addSystemMessage(
				tournament,
				"tournament.placeResult",
				{ place: (index + 1).toString(), username: player.alias }
			);
		});

		for (const p of tournament.players) {
			if (!p.ws) continue;
			const payload = {
				type: "tournamentFinished",
				data: { results: results.map((r, i) => ({ place: i + 1, player: r })) }
			};
			try {
				p.ws.send(JSON.stringify(payload));
			} catch {}
		}

		const tournamentId = await createTournamentHistory(tournament);
		const playerIds = tournament.players.filter(p => !!p.id).map(p => p.id);

		for (const playerId of playerIds) {
			const recentMatches = await getRecentMatches(playerId);
			for (let i = 0; i < recentMatches.length; i++) {
				const match = recentMatches[i];
				const round = i === 0 ? 2 : 1;
				try {
					await updateMatchRep(tournamentId, round, match.id);
				} catch {}
			}
		}
	} catch {}
}

function generateMatchId(tournament) {
	return tournament.matches.length + 1;
}

async function roundWin(userId, ws, data) {
	await handleRoundWin(userId, { data }, ws);
}

module.exports = { roundWin };
