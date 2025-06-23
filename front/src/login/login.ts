import { logInApi } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { navigateTo } from "../view/history_views.js";

export async function logIn(event: Event) {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const username = (form.elements.namedItem("user") as HTMLInputElement).value
  const password = (form.elements.namedItem("password") as HTMLInputElement).value;

  const res = await logInApi(username, password);

  if (res.success) {
    showSuccessMessage(`Login successfull for user ${username}`)
	const params = new URLSearchParams({ email: username })
		setTimeout(() => {
		navigateTo('two_fa', params);
	}, 3000);
  } else {
    console.error('Login failed:', res.error);
	showErrorMessage(`Login failed: ${res.error}`)
  }
}
