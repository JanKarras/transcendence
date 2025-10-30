export async function getFriends() {
	try {
		const response = await fetch('/api/get/friends', {
			credentials: 'include',
		});
		if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
		return await response.json();
	} catch (error) {
		console.error('Error fetching friends:', error);
		return [];
	}
}
