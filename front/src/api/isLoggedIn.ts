export async function is_logged_in_api(): Promise<boolean> {
	try {
		const res = await fetch("/api/get/is_logged_in", {
			method: "GET",
			credentials: "include",
		});
		if (!res.ok) {
			return false;
		}

		const data = await res.json();
		return data.loggedIn === true;
	} catch (err) {
		return false;
	}
}
