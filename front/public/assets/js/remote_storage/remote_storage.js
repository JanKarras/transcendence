var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function createUser(username, email, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = JSON.stringify({ username, email, password });
        try {
            const response = yield fetch('/api/set/createUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
            });
            if (!response.ok) {
                const errData = yield response.json().catch(() => ({}));
                return { success: false, error: errData.error || 'Request failed' };
            }
            const data = yield response.json();
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error.error };
        }
    });
}
export function logInApi(username, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = JSON.stringify({ username, password });
        try {
            const response = yield fetch('/api/set/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body,
            });
            if (!response.ok) {
                const errData = yield response.json().catch(() => ({}));
                return { success: false, error: errData.error || 'Request failed' };
            }
            const data = yield response.json();
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error.error };
        }
    });
}
export function logOutApi() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch('/api/set/logout', {
                method: 'POST',
                credentials: 'include',
            });
            if (!response.ok) {
                const errData = yield response.json().catch(() => ({}));
                return { success: false, error: errData.error || 'Request failed' };
            }
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message || 'Network error' };
        }
    });
}
export function emailValidationApi(email, code) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = JSON.stringify({ email, code });
        try {
            const response = yield fetch('/api/set/emailValidation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body
            });
            if (!response.ok) {
                const errData = yield response.json().catch(() => ({}));
                return { success: false, error: errData.error || 'Request failed' };
            }
            const data = yield response.json();
            return { success: true, data };
        }
        catch (error) {
            return { success: false, error: error.error };
        }
    });
}
export function is_logged_in_api() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch("/api/get/is_logged_in", {
                method: "GET",
                credentials: "include",
            });
            if (!res.ok) {
                return false;
            }
            const data = yield res.json();
            return data.loggedIn === true;
        }
        catch (err) {
            return false;
        }
    });
}
export const api = {
    createUser,
    logInApi,
    logOutApi,
    emailValidationApi
};
