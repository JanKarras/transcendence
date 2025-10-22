import { logInApi } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { navigateTo } from "../view/history_views.js";
import { initTranslations, t } from "../constants/i18n.js"

export async function logIn(event: Event) {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const username = (form.elements.namedItem("user") as HTMLInputElement).value;
  const password = (form.elements.namedItem("password") as HTMLInputElement).value;

  const res = await logInApi(username, password);

  await initTranslations();
  if (res.success) {
    if (res.requires2fa) {
      showSuccessMessage(t('loginSuccess'));
      const params = new URLSearchParams({ email: username });
      setTimeout(() => {
        navigateTo('two_fa', params);
      }, 1500);
    } else {
      showSuccessMessage(t('loginSuccess').replace("{username}", username));
      setTimeout(() => {
        navigateTo('dashboard');
      }, 1500);
    }
  } else {
    console.error('Login failed:', res.error);
    showErrorMessage(t('loginFailed').replace("{error}", res.error));
  }
}

