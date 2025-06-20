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

export async function logInApi(username: string, password: string) {
	const body = JSON.stringify({ username, password })
  try {
	const response = await fetch('/api/set/login', {
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

export const api = {
	createUser,
	logInApi,
	logOutApi,
	emailValidationApi,
	is_logged_in_api
};
