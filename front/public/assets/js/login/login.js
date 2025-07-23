import { logInApi } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { navigateTo } from "../view/history_views.js";
import { lang, t } from "../constants/language_vars.js";
import { LANGUAGE } from "../constants/gloabal.js";
export async function logIn(event) {
    event.preventDefault();
    const form = event.target;
    const username = form.elements.namedItem("user").value;
    const password = form.elements.namedItem("password").value;
    const res = await logInApi(username, password);
    if (res.success) {
        showSuccessMessage(t(lang.loginSuccess, LANGUAGE).replace("{username}", username));
        const params = new URLSearchParams({ email: username });
        setTimeout(() => {
            navigateTo('two_fa', params);
        }, 3000);
    }
    else {
        console.error('Login failed:', res.error);
        showErrorMessage(t(lang.loginFailed, LANGUAGE).replace("{error}", res.error));
    }
}
