const { onGoingTournaments } = require("./tournamentStore");
const { createMatch } = require("../game/matchService");

async function startTournament(userId, ws, data) {
  const tournament = onGoingTournaments.get(userId);
  if (!tournament || !tournament.ready) return;

  const p = tournament.players;
  const match1 = { id: 1, round: 0, playerLeft: p[0], playerRight: p[1], winner: null, loser: null };
  const match2 = { id: 2, round: 0, playerLeft: p[2], playerRight: p[3], winner: null, loser: null };

  createMatch({ userId: p[0].id, ws: p[0].ws }, { userId: p[1].id, ws: p[1].ws });
  createMatch({ userId: p[2].id, ws: p[2].ws }, { userId: p[3].id, ws: p[3].ws });

  tournament.players.forEach(player => player.ws.send(JSON.stringify({ type: "tournamentStarting", data: { gameId: userId } })));
  tournament.started = true;
  tournament.matches.push(match1, match2);
}

module.exports = {
	startTournament
}
