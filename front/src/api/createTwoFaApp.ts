export async function createTwoFaApp(): Promise<{ success: boolean; qrCodeDataUrl?: string; error?: string }> {
	try {
		const res = await fetch('/api/get/2fa/setup', {
			method: 'GET',
			credentials: 'include'
		});

		if (!res.ok) {
			const errData = await res.json().catch(() => ({}));
			return { success: false, error: errData.error || 'Request failed' };
		}

		const data = await res.json();
		return { success: true, qrCodeDataUrl: data.qrCodeDataUrl };
	} catch (err: any) {
		return { success: false, error: err.message || 'Network error' };
	}
}
