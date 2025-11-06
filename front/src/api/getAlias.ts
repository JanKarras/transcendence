export async function getAlias(username: string): Promise<string | null> {
	if (!username) return null;

	try {
		const res = await fetch(`/api/get/alias?username=${encodeURIComponent(username)}`, {
			method: "GET",
			credentials: "include",
			headers: { Accept: "application/json" },
		});

		if (!res.ok) {
			console.warn(`⚠️ [getAlias] Failed to fetch alias: ${res.status}`);
			return null;
		}

		const data = (await res.json()) as { alias?: string | null };
		return data.alias || null;
	} catch (err) {
		console.error("❌ [getAlias] Error fetching alias:", err);
		return null;
	}
}
