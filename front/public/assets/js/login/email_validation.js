import { LANGUAGE } from "../constants/gloabal.js";
import { lang, t } from "../constants/language_vars.js";
import { emailValidationApi } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
export async function validate_email(email) {
    const inputs = Array.from(document.querySelectorAll("#emailValidationForm input"));
    const code = inputs.map(input => input.value.trim()).join('');
    const isValidCode = /^[0-9]{6}$/.test(code);
    if (!isValidCode) {
        showErrorMessage(t(lang.invalidCode, LANGUAGE));
        return;
    }
    const res = await emailValidationApi(email, code);
    if (res.success) {
        showSuccessMessage(t(lang.emailValidated, LANGUAGE));
        render_with_delay("login");
    }
    else {
        console.log(res.error);
        showErrorMessage(res.error);
    }
}
