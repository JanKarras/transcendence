import { Friend, UserInfo, UserResponse } from "../constants/structs.js";

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

export async function sendFriendRequestApi(user: UserInfo): Promise<{ success: boolean; error?: string }> {
	const body = JSON.stringify(user);

	try {
		const response = await fetch('/api/set/sendFriendRequest', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body,
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

export async function two_fa_api(email: string, code: string) {
	const body = JSON.stringify({ email, code })
  try {
	const response = await fetch('/api/set/two_fa_api', {
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

export async function getUser(): Promise<UserResponse | false> {
	try {
		const res = await fetch("/api/get/getUser", {
			method: "GET",
			credentials: "include",
		});

		const data :UserResponse = await res.json();
		
		return data
	} catch (err) {
		return false;
	}
}

export async function getAllUser(): Promise<UserInfo[]> {
	try {
		const response = await fetch("/api/get/getAllUser");

		if (!response.ok) {
			throw new Error(`HTTP error: ${response.status}`);
		}

		const data: UserInfo[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching users:", error);
		return [];
	}
}

export async function getAllFriends(): Promise<Friend[]> {
	try {
		const response = await fetch("/api/get/getAllFriends");

		if (!response.ok) {
			throw new Error(`HTTP error: ${response.status}`);
		}

		const data: Friend[] = await response.json();
		return data;
	} catch (error) {
		console.error("Error fetching friends:", error);
		return [];
	}
}

export async function saveProfileChanges(updateData: FormData) {
	try {
		const response = await fetch('/api/set/updateUser', {
			method: 'POST',
			body: updateData,
			credentials: 'include',
		});
		console.log(response);
		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			return { success: false, error: errData.error || 'Request failed' };
		}

		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message || 'Network error' };
	}
}

export const api = {
	createUser,
	logInApi,
	logOutApi,
	emailValidationApi,
	is_logged_in_api,
	two_fa_api
};
