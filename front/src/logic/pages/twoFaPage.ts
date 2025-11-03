import { twoFaApi } from "../../api/twoFa.js";
import { setEventListenersForTwoFaPage } from "../../events/pages/twoFaPage.js";
import { renderTwoFaPage } from "../../render/pages/renderTwoFaPage.js";
import { initTranslations, t } from "../global/initTranslations.js";
import { renderWithDelay } from "../global/renderWithDelay.js";
import { headerTemplate } from "../templates/headerTemplate.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popupMessage.js";

export async function twoFaPage(params: URLSearchParams | null) {
	await initTranslations();

	await headerTemplate();

	const email = params?.get('email') || null;
	const method = params?.get("method") || null;

	if (!email || !method) {
		showErrorMessage("Please use the link we send you to you'r email address");
		renderWithDelay('login')
		return;
	}

	await renderTwoFaPage(email, method);

	await setEventListenersForTwoFaPage(email, method)
}

export async function twoFa(email: string, method: string = 'email') {
	await initTranslations();

	let code = '';

	if (method === 'email') {
		const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("#emailValidationForm input"));
		code = inputs.map(input => input.value.trim()).join('');
	} else if (method === 'authapp') {
		const input = document.getElementById("authAppCode") as HTMLInputElement | null;
		code = input?.value.trim() || '';
	}

	if (!/^[0-9]{6}$/.test(code)) {
		showErrorMessage(t('invalid6DigitCode'));
		return;
	}

	try {
		const res = await twoFaApi(email, code, method);

		if (res.success) {
			showSuccessMessage(t('twoFASuccess'));
			renderWithDelay('dashboard');
		} else {
			showErrorMessage(res.error || t('twoFAFail'));
		}
	} catch (err: any) {
		console.error(err);
		showErrorMessage(err.message || t('twoFAFail'));
	}
}
