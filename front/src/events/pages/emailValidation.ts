import { validateEmail } from "../../logic/pages/emailValidationPage.js";

export async function setEventListenersForEmailValidation(email : string) {
	const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("#emailValidationForm input"));

	inputs.forEach((input, idx) => {
		input.addEventListener("input", () => {
			if (input.value.length === 1 && idx < inputs.length - 1) {
				inputs[idx + 1].focus();
			}
		});
		input.addEventListener("keydown", (e) => {
			if (e.key === "Backspace" && input.value === "" && idx > 0) {
				inputs[idx - 1].focus();
			}
		});
	});

	const submit = document.getElementById("submitCodeBtn");
	if (submit) {
		submit.addEventListener("click", () => {
			validateEmail(email);
		});
	}
}