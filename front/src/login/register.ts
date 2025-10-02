import { createUser } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { initTranslations, t } from "../constants/i18n.js"

function passwordValidation(password: string): { valid: boolean; error?: string } {
	if (password.length < 8) {
	  return { valid: false, error: t('passwordLength') };
	}
	if (!/[A-Z]/.test(password)) {
	  return { valid: false, error: t('passwordUppercase') };
	}
	if (!/[a-z]/.test(password)) {
	  return { valid: false, error: t('passwordLowercase') };
	}
	if (!/[0-9]/.test(password)) {
	  return { valid: false, error: t('passwordNumber') };
	}
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
	  return { valid: false, error: t('passwordSpecialChar') };
	}
	if (/\s/.test(password)) {
	  return { valid: false, error: t('passwordNoSpaces') };
	}
	return { valid: true };
}

export async function registerUser(event: Event) {
	event.preventDefault();

	const form = event.target as HTMLFormElement;

	const username = (form.elements.namedItem("username") as HTMLInputElement).value
	const email = (form.elements.namedItem("email") as HTMLInputElement).value
	const password = (form.elements.namedItem("password") as HTMLInputElement).value;
	const password2 = (form.elements.namedItem("password2") as HTMLInputElement).value;

    await initTranslations();
	if (password !== password2) {
		showErrorMessage(t('passwordMismatch'));
		return;
	}

	const valid = passwordValidation(password);

	if (!valid.valid) {
		showErrorMessage(valid.error ?? t('unknownError'));
		return
	}

	const res = await createUser(username, email, password);

	if (res.success) {
		showSuccessMessage(t('registerSuccess'));
		render_with_delay("login");
	} else {
		showErrorMessage(t('registerFailed').replace("{error}", res.error));
	}
}
