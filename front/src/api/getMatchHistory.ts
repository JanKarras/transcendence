import { MatchHistoryEntry } from "../constants/structs.js";

export async function getMatchHistory(userId: number): Promise<MatchHistoryEntry[] | undefined> {
	try {
		const res = await fetch(`/api/get/getMatchHistory?userId=${userId}`, {
			method: "GET",
			credentials: "include",
		});

		if (!res.ok) {
			const errData = await res.json().catch(() => ({}));
			console.error("Failed to fetch match history:", errData.error || res.statusText);
			return [];
		}

		const data: { matchHistory: MatchHistoryEntry[] } = await res.json();
		console.log("Match History für User", userId, data.matchHistory);

		return data.matchHistory;
	} catch (err: any) {
		console.error("Error fetching match history:", err);
		return [];
	}
}
