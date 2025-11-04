const tournamentUtils = require("./utils");
const { createMatch } = require("../game/matchService");
const { createTournamentHistory, getRecentMatches, updateMatchRep } = require("../../repositories/tournamentMatchHistoryRepository");
const { incrementTournamentWins } = require("../../repositories/statsRepository");

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
	tournamentUtils.addSystemMessage(
		tournament,
		"tournament.roundFinished",
		{
			winner: winner.name,
			loser: loser.name
		}
	);

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

	tournamentUtils.addSystemMessage(
		tournament,
		isConsolation ? "tournament.consolationMatch" : "tournament.nextMatch",
		{
			player1: players[0].name,
			player2: players[1].name
		}
	);


	player1.ws.send(JSON.stringify({ type: "startSecondRound" }));
	player2.ws.send(JSON.stringify({ type: "startSecondRound" }));
}


async function finishTournament(tournament) {

	try {
		tournament.round = 2;

		tournamentUtils.addSystemMessage(
			tournament,
			"tournament.finished"
		);

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
				incrementTournamentWins(userId);
			} catch (err) {
				console.error(`⚠️ Failed to increment tournamentWins for ${userId}:`, err.message);
			}
		} else {
			console.warn("⚠️ No first-place player found, skipping tournament win increment.");
		}

		results.forEach((player, index) => {
			tournamentUtils.addSystemMessage(
				tournament,
				"tournament.placeResult",
				{
					place: (index + 1).toString(),
					username: player.name
				}
			);
		});

		tournament.players.forEach(p => {
			if (!p.ws) {
				return;
			}
			const payload = {
				type: "tournamentFinished",
				data: { results: results.map((r, i) => ({ place: i + 1, player: r })) }
			};
			p.ws.send(JSON.stringify(payload));
		});

		const tournamentId = await createTournamentHistory(tournament);

		const playerIds = tournament.players
			.filter(p => !!p.id)
			.map(p => p.id);

		for (const playerId of playerIds) {
			const recentMatches = await getRecentMatches(playerId);

			for (let i = 0; i < recentMatches.length; i++) {
				const match = recentMatches[i];
				const round = i === 0 ? 2 : 1;

				try {
					await updateMatchRep(tournamentId, round, match.id);
				} catch (err) {
					console.error(`❌ Failed to update match ${match.id}:`, err.message);
				}
			}
		}

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
