import { bodyContainer } from "../constants/constants.js";
import { render_login } from "./render_login.js";


export function render_register() {
	if (!bodyContainer) {
		return;
	}
	bodyContainer.innerHTML = `
	<div id="RegContainer" class="d-none">
		<h2>Registrieren</h2>
		<form>
			<label>Username: <input type="text" name="username" required></label><br />
			<label>Email: <input type="email" name="email" required></label><br />
			<label>Passwort: <input type="password" name="password" required></label><br />
			<label>Confirm Passwort: <input type="password" name="password2" required></label><br />
			<button type="submit">Register</button>
		</form>
		<button id="backToLoginBtn">Back</button>
	</div>
	`
	const backToLoginBtn = document.getElementById("backToLoginBtn");
	if (backToLoginBtn) {
		backToLoginBtn.addEventListener("click", () => {
			render_login();
		})
	}
}
