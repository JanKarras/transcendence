import { logInApi } from "../remote_storage/remote_storage.js";

export async function logIn(event: Event) {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const username = (form.elements.namedItem("user") as HTMLInputElement).value
  const password = (form.elements.namedItem("password") as HTMLInputElement).value;

  const res = await logInApi(username, password);

  if (res.success) {
    console.log(`User "${username}" logged in successfully.`);

  } else {
    console.error('Login failed:', res.error);
    alert(`Login failed: ${res.error}`);
  }
}
