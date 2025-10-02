import { initTranslations, t } from "../constants/i18n.js"
import { emailValidationApi } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";

export async function validate_email(email: string) {
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
	render_with_delay("login");
  } else {
	console.log(res.error);
	showErrorMessage(res.error)
  }
}
