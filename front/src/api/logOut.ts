export async function logOutApi() {
	try {
		const response = await fetch('/api/set/logout', {
			method: 'POST',
			credentials: 'include',
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			return { success: false, error: errData.error || 'Request failed' };
		}

		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message || 'Network error' };
	}
}
