export async function logInApi(username: string, password: string) {
	const body = JSON.stringify({ username, password })
	try {
		const response = await fetch('/api/set/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body,
		});

		const data = await response.json().catch(() => ({}));

		if (!response.ok) {
			return { success: false, error: data.error || 'Request failed' };
		}

		return { success: true, ...data };
	} catch (error: any) {
		return { success: false, error: error.message || 'Network error' };
	}
}
