import { two_fa_api } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { initTranslations, t } from "../constants/i18n.js"

export async function two_fa(email: string, method: string = 'email') {
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
		const res = await two_fa_api(email, code, method);

		if (res.success) {
			showSuccessMessage(t('twoFASuccess'));
			render_with_delay('dashboard');
		} else {
			showErrorMessage(res.error || t('twoFAFail'));
		}
	} catch (err: any) {
		console.error(err);
		showErrorMessage(err.message || t('twoFAFail'));
	}
}
