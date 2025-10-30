export async function getStatus(friendId: number): Promise<number> {
	const res = await fetch(`/api/get/status/${friendId}`, {
		method: 'GET',
		credentials: 'include',
		headers: { Accept: 'application/json' },
	});
	if (!res.ok) throw new Error(`Failed to check user status: ${res.status}`);

	const data: { status: number | string | boolean } = await res.json();
	return Number(data.status) ? 1 : 0;
}
