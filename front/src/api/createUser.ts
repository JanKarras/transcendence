export async function createUser(username: string, email: string, password: string) {
	const body = JSON.stringify({ username, email, password })
	try {
		const response = await fetch('/api/set/createUser', {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json',
			},
			body,
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			return { success: false, error: errData.error || 'Request failed' };
		}

		const data = await response.json();
		return { success: true, data };
	} catch (error: any) {
		return { success: false, error: error.error };
 	}
}
