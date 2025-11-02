export async function getBlocked(friendId: number | null) {
	const res = await fetch(`/api/get/blocked/${friendId}`, {
		method: 'GET',
		credentials: 'include',
		headers: { Accept: 'application/json' },
	});
	if (!res.ok) throw Error(`Failed to check block status: ${res.status}`);
	const data = (await res.json()) as { blocked: number };
	return data.blocked;
}
