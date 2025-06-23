import { emailValidationApi } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
export async function validate_email(email) {
    const inputs = Array.from(document.querySelectorAll("#emailValidationForm input"));
    const code = inputs.map(input => input.value.trim()).join('');
    const isValidCode = /^[0-9]{6}$/.test(code);
    if (!isValidCode) {
        showErrorMessage("Please enter a valid 6-digit code.");
        return;
    }
    const res = await emailValidationApi(email, code);
    if (res.success) {
        showSuccessMessage("You validatet your accoutn successfully. You will be redirected to the login in 3 seconds");
        render_with_delay("login");
    }
    else {
        console.log(res.error);
        showErrorMessage(res.error);
    }
}
