const tournamentUtils = require("./utils");
const { createMatch } = require("../game/matchService");

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

	player1.ws.send(JSON.stringify({ type: "startSecondRound" }));
	player2.ws.send(JSON.stringify({ type: "startSecondRound" }));
}

async function finishTournament(tournament) {
	tournament.round = 2;
	tournamentUtils.addSystemMessage(tournament, "🏁 Tournament finished! Calculating final results...");

	const finalMatch = tournament.matches.find(m => m.round === 1 && !m.isConsolation);
	const consolationMatch = tournament.matches.find(m => m.round === 1 && m.isConsolation);

	const results = [
		finalMatch?.winner,
		finalMatch?.loser,
		consolationMatch?.winner,
		consolationMatch?.loser
	].filter(Boolean);

	results.forEach((player, index) => tournamentUtils.addSystemMessage(tournament, `🥇${index + 1} Place: ${player.name}`));

	tournament.players.forEach(p => {
		if (!p.ws) return;
		p.ws.send(JSON.stringify({
			type: "tournamentFinished",
			data: { results: results.map((r, i) => ({ place: i + 1, player: r })) }
		}));
	});
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
