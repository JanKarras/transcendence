export async function createUser(username, email, password) {
    const body = JSON.stringify({ username, email, password });
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
    }
    catch (error) {
        return { success: false, error: error.error };
    }
}
export async function sendFriendRequestApi(user) {
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
    }
    catch (error) {
        return { success: false, error: error.message || 'Network error' };
    }
}
export async function logInApi(username, password) {
    const body = JSON.stringify({ username, password });
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
    }
    catch (error) {
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
    }
    catch (error) {
        return { success: false, error: error.message || 'Network error' };
    }
}
export async function emailValidationApi(email, code) {
    const body = JSON.stringify({ email, code });
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
    }
    catch (error) {
        return { success: false, error: error.error };
    }
}
export async function two_fa_api(email, code) {
    const body = JSON.stringify({ email, code });
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
    }
    catch (error) {
        return { success: false, error: error.error };
    }
}
export async function is_logged_in_api() {
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
    }
    catch (err) {
        return false;
    }
}
export async function getUser() {
    try {
        const res = await fetch("/api/get/getUser", {
            method: "GET",
            credentials: "include",
        });
        const data = await res.json();
        return data;
    }
    catch (err) {
        return false;
    }
}
export async function getAllUser() {
    try {
        const response = await fetch("/api/get/getAllUser");
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}
export async function getAllFriends() {
    try {
        const response = await fetch("/api/get/getAllFriends");
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error("Error fetching friends:", error);
        return [];
    }
}
export async function saveProfileChanges(updateData) {
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
    }
    catch (error) {
        return { success: false, error: error.message || 'Network error' };
    }
}
export async function handleAcceptRequestApi(request) {
    const body = JSON.stringify(request);
    try {
        const response = await fetch('/api/set/handleAcceptRequest', {
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
    }
    catch (error) {
        return { success: false, error: error.message || 'Network error' };
    }
}
export async function handleDeclineRequestApi(request) {
    const body = JSON.stringify(request);
    try {
        const response = await fetch('/api/set/handleDeclineRequest', {
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
    }
    catch (error) {
        return { success: false, error: error.message || 'Network error' };
    }
}
export async function removeFriendApi(friend) {
    try {
        const response = await fetch('/api/set/removeFriend', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ friendUsername: friend.username }),
        });
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            return { success: false, error: errData.error || 'Request failed' };
        }
        return { success: true };
    }
    catch (error) {
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
