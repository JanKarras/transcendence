import { createUser } from "../../api/createUser.js";
import { setEventListenersForRegisterPage } from "../../events/pages/registerPage.js";
import { renderRegisterPage } from "../../render/pages/renderRegisterPage.js";
import { showErrorMessage, showSuccessMessage } from "../../templates/popup_message.js";
import { initTranslations, t } from "../gloabal/initTranslations.js";
import { renderWithDelay } from "../gloabal/renderWithDelay.js";
import { headerTemplate } from "../templates/headerTemplate.js";

export async function registerPage(params: URLSearchParams | null) {
	await initTranslations();

	await headerTemplate()

	await renderRegisterPage(params)

	await setEventListenersForRegisterPage()
}

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
		renderWithDelay("login");
	} else {
		showErrorMessage(t('registerFailed').replace("{error}", res.error));
	}
}
