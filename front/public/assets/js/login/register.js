import { createUser } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { lang, t } from "../constants/language_vars.js";
import { LANGUAGE } from "../constants/gloabal.js";
function passwordValidation(password) {
    if (password.length < 8) {
        return { valid: false, error: t(lang.passwordLength, LANGUAGE) };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: t(lang.passwordUppercase, LANGUAGE) };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, error: t(lang.passwordLowercase, LANGUAGE) };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: t(lang.passwordNumber, LANGUAGE) };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, error: t(lang.passwordSpecialChar, LANGUAGE) };
    }
    if (/\s/.test(password)) {
        return { valid: false, error: t(lang.passwordNoSpaces, LANGUAGE) };
    }
    return { valid: true };
}
export async function registerUser(event) {
    event.preventDefault();
    const form = event.target;
    const username = form.elements.namedItem("username").value;
    const email = form.elements.namedItem("email").value;
    const password = form.elements.namedItem("password").value;
    const password2 = form.elements.namedItem("password2").value;
    if (password !== password2) {
        showErrorMessage(t(lang.passwordMismatch, LANGUAGE));
        return;
    }
    const valid = passwordValidation(password);
    if (!valid.valid) {
        showErrorMessage(valid.error ?? t(lang.unknownError, LANGUAGE));
        return;
    }
    const res = await createUser(username, email, password);
    if (res.success) {
        showSuccessMessage(t(lang.registerSuccess, LANGUAGE));
        render_with_delay("login");
    }
    else {
        showErrorMessage(t(lang.registerFailed, LANGUAGE).replace("{error}", res.error));
    }
}
