import { two_fa } from "../index/two_fa.js";
import { logInApi } from "../remote_storage/remote_storage.js";
import { render_two_fa } from "../view/two_fa.js";

export async function logIn(event: Event) {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const username = (form.elements.namedItem("user") as HTMLInputElement).value
  const password = (form.elements.namedItem("password") as HTMLInputElement).value;

  const res = await logInApi(username, password);

  if (res.success) {
    console.log(`User "${username}" logged in successfully.`);
	two_fa();
	render_two_fa();
  } else {
    console.error('Login failed:', res.error);
    alert(`Login failed: ${res.error}`);
  }
}
