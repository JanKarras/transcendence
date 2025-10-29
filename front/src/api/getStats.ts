import { Stats } from "../constants/structs.js";

export async function getStats(userId: number): Promise<Stats | undefined> {
	try {
		const res = await fetch(`/api/get/getStats?userId=${userId}`, {
			method: "GET",
			credentials: "include",
		});

		if (!res.ok) {
			const errData = await res.json().catch(() => ({}));
			console.error("Failed to fetch match stats:", errData.error || res.statusText);
			return undefined;
		}

		const data: Stats = await res.json();

		return data;
	} catch (err: any) {
		console.error("Error fetching stats:", err);
		return undefined;
	}
}
