import { two_fa_api } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { initTranslations, t } from "../constants/i18n.js"

export async function two_fa(email: string) {
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("#emailValidationForm input"));

  const code = inputs.map(input => input.value.trim()).join('');

  const isValidCode = /^[0-9]{6}$/.test(code);

  await initTranslations();
  if (!isValidCode) {
	showErrorMessage(t('invalid6DigitCode'));
	return;
  }

	const res = await two_fa_api(email, code);
  	if (res.success) {
			showSuccessMessage(t('twoFASuccess'));
			render_with_delay('dashboard')
  	} else {
		showErrorMessage(res.error)
 	}
}
