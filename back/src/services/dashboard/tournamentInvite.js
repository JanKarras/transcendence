const { activeDashboardSockets } = require("./dashboardStore");

async function tournamentInvite(invitedPlayer, userId) {
	console.log("🎯 [tournamentInvite] Starting invite process...");
	console.log("📦 [tournamentInvite] invitedPlayer:", invitedPlayer);
	console.log("👤 [tournamentInvite] Inviter userId:", userId);

	if (!invitedPlayer || !invitedPlayer.id) {
		console.error("❌ [tournamentInvite] Invalid invitedPlayer object:", invitedPlayer);
		return false;
	}

	const invitedPlayerWs = activeDashboardSockets.get(invitedPlayer.id);
	if (invitedPlayerWs) {
		console.log(`🟢 [tournamentInvite] Found active WebSocket for player ${invitedPlayer.id} (${invitedPlayer.username || "unknown"}).`);
		const data = { gameId: userId };

		try {
			invitedPlayerWs.send(JSON.stringify({ type: "invitedToTournament", data }));
			console.log(`✅ [tournamentInvite] Sent tournament invite to player ${invitedPlayer.id} (${invitedPlayer.username || "unknown"}).`);
			return true;
		} catch (err) {
			console.error(`❌ [tournamentInvite] Failed to send invite to player ${invitedPlayer.id}:`, err);
			return false;
		}
	} else {
		console.warn(`⚠️ [tournamentInvite] No active WebSocket found for player ${invitedPlayer.id} (${invitedPlayer.username || "unknown"}).`);
		return false;
	}
}

module.exports = {
	tournamentInvite
};
