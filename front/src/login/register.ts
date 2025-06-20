import { createUser } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { render_login } from "../view/render_login.js";

function passwordValidation(password: string): { valid: boolean; error?: string } {
	if (password.length < 8) {
	  return { valid: false, error: "Password must be at least 8 characters long." };
	}
	if (!/[A-Z]/.test(password)) {
	  return { valid: false, error: "Password must contain at least one uppercase letter." };
	}
	if (!/[a-z]/.test(password)) {
	  return { valid: false, error: "Password must contain at least one lowercase letter." };
	}
	if (!/[0-9]/.test(password)) {
	  return { valid: false, error: "Password must contain at least one number." };
	}
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
	  return { valid: false, error: "Password must contain at least one special character." };
	}
	if (/\s/.test(password)) {
	  return { valid: false, error: "Password cannot contain spaces." };
	}
	return { valid: true };
}

export async function registerUser(event: Event) {
	event.preventDefault();

	const form = event.target as HTMLFormElement;

	const username = (form.elements.namedItem("username") as HTMLInputElement).value
	const email = (form.elements.namedItem("email") as HTMLInputElement).value
	const password = (form.elements.namedItem("password") as HTMLInputElement).value;
	const password2 = (form.elements.namedItem("password2") as HTMLInputElement).value;

	if (password !== password2) {
		showErrorMessage("Passwords do not match!");
		return;
	}

	const valid = passwordValidation(password);

	if (!valid.valid) {
		showErrorMessage(valid.error ?? "Unknown error")
		return
	}

	const res = await createUser(username, email, password);

	if (res.success) {
		showSuccessMessage("Register was succsessfull. Please remember to validate your email adress");
		render_login();
	} else {
		showErrorMessage(`Registration failed: ${res.error}`);
	}
}
