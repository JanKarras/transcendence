import { createUser } from "../../api/createUser.js";
import { setEventListenersForRegisterPage } from "../../events/pages/registerPage.js";
import { renderRegisterPage } from "../../render/pages/renderRegisterPage.js";
import { initTranslations, t } from "../global/initTranslations.js";
import { renderWithDelay } from "../global/renderWithDelay.js";
import { headerTemplate } from "../templates/headerTemplate.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popupMessage.js";

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

	const username = (form.elements.namedItem("username") as HTMLInputElement).value.trim();
	const alias = (form.elements.namedItem("alias") as HTMLInputElement).value.trim();
	const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
	const password = (form.elements.namedItem("password") as HTMLInputElement).value;
	const password2 = (form.elements.namedItem("password2") as HTMLInputElement).value;

	await initTranslations();

	if (password !== password2) {
		return showErrorMessage(t('passwordMismatch'));
	}

	const valid = passwordValidation(password);
	if (!valid.valid) {
		return showErrorMessage(valid.error ?? t('unknownError'));
	}

	const res = await createUser(username, alias, email, password);

	if (res.success) {
		showSuccessMessage(t('registerSuccess'));
		renderWithDelay("login");
		return;
	}

	let errorMessage = res.error || t('unknownError');

	if (errorMessage.includes('Invalid email')) {
		errorMessage = t('invalidEmail');
	} else if (errorMessage.includes('Invalid username')) {
		errorMessage = t('invalidUsername');
	} else if (errorMessage.includes('Password')) {
		errorMessage = t('invalidPassword');
	} else if (errorMessage.includes('exists')) {
		errorMessage = t('userExists');
	} else if (errorMessage.includes('Missing credentials')) {
		errorMessage = t('missingCredentials');
	}

	showErrorMessage(errorMessage);
}
