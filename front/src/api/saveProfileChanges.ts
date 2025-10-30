export async function saveProfileChanges(updateData: FormData) {
	try {
		const response = await fetch('/api/set/updateUser', {
			method: 'POST',
			body: updateData,
			credentials: 'include',
		});

		if (!response.ok) {
			let errorMsg: string | undefined;

			try {
				const errData = await response.json();
				errorMsg = errData.error || errData.message;
			} catch {
				errorMsg = response.statusText;
			}

			return {
				success: false,
				status: response.status,
				error: errorMsg || 'Request failed'
			};
		}

		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message || 'Network error' };
	}
}
