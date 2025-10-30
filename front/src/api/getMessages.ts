export async function getMessages(friendId: number) {
	try {
		const response = await fetch(`/api/get/messages/${friendId}`, {
			credentials: 'include',
		});
		if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
		return await response.json();
	} catch (error) {
		console.error('Error fetching messages:', error);
		return [];
	}
}
