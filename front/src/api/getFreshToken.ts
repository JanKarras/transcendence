export async function getFreshToken(): Promise<string | null> {
	try {
		const res = await fetch('/api/get/token', { credentials: 'include' });
		if (!res.ok) {
			throw new Error('Не удалось получить токен');
		}
		const data = await res.json();
		if (data?.token) {
			localStorage.setItem('auth_token', data.token);
			return data.token;
		}
		return null;
	} catch (err) {
		console.error('Ошибка обновления токена:', err);
		return null;
	}
}
