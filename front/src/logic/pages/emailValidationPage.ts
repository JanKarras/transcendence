import { emailValidationApi } from "../../api/emailValidation.js";
import { setEventListenersForEmailValidation } from "../../events/pages/emailValidation.js";
import { renderEmailValidation } from "../../render/pages/renderEmailValidation.js";
import { showErrorMessage, showSuccessMessage } from "../../templates/popup_message.js";
import { initTranslations, t } from "../gloabal/initTranslations.js";
import { renderWithDelay } from "../gloabal/renderWithDelay.js";
import { headerTemplate } from "../templates/headerTemplate.js";

export async function emailValidationPage(params: URLSearchParams | null) {
	await initTranslations();

	await headerTemplate();

	const email = params?.get("email") || null;

	if (email === null) {
		showErrorMessage(t('emailMissingWarning'));
		renderWithDelay("login");
		return;
	}

	await renderEmailValidation(email)

	await setEventListenersForEmailValidation(email)
}

export async function validateEmail(email: string) {
	const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("#emailValidationForm input"));

	const code = inputs.map(input => input.value.trim()).join('');

	const isValidCode = /^[0-9]{6}$/.test(code);

	await initTranslations();
	if (!isValidCode) {
		showErrorMessage(t('invalidCode'));
		return;
	}

	const res = await emailValidationApi(email, code);
	if (res.success) {
		showSuccessMessage(t('emailValidated'));
		renderWithDelay("login");
	} else {
		console.log(res.error);
		showErrorMessage(res.error)
	}
}