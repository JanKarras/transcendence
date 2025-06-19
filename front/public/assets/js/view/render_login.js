import { bodyContainer } from "../constants/constants.js";
import { logIn } from "../login/login.js";
import { render_register } from "./render_register.js";
export function render_login() {
    if (!bodyContainer) {
        return;
    }
    bodyContainer.innerHTML = `
		<div id="loginContainer">
			<h2>Login</h2>
			<form id="loginForm">
	  			<label>Username oder Email: <input type="text" name="user" required></label><br />
	  			<label>Passwort: <input type="password" name="password" required></label><br />
	  			<button type="submit">Einloggen</button>
			</form>
			<button id="registerBtn">Register</button>
		</div>
	`;
    const regBtn = document.getElementById("registerBtn");
    if (regBtn) {
        regBtn.addEventListener("click", () => {
            render_register();
        });
    }
    const submit = document.getElementById("loginForm");
    if (submit) {
        submit.addEventListener("submit", (event) => {
            logIn(event);
        });
    }
}
