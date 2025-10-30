export async function emailValidationApi(email: string, code: string) {
	const body = JSON.stringify({ email, code })
	try {
		const response = await fetch('/api/set/emailValidation', {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json',
			},
			body
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