export async function twoFaApi(email: string, code: string, method: string = 'email') {
	const body = JSON.stringify({ email, code, method });

	try {
		const response = await fetch('/api/set/two_fa_api', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
		});

		const data = await response.json().catch(() => ({}));

		if (!response.ok) {
			return { success: false, error: data.error || 'Request failed' };
		}

		return { success: true, data };
	} catch (error: any) {
		return { success: false, error: error.message || 'Network error' };
	}
}