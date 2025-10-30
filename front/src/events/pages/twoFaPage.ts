import { twoFa } from "../../logic/pages/twoFaPage.js";

export async function setEventListenersForTwoFaPage(email: string, method: string) {
	if (method === "email") {
		const inputs = Array.from(document.querySelectorAll<HTMLInputElement>("#emailValidationForm input"));
		
		inputs.forEach((input, idx) => {
			input.addEventListener("input", () => {
				if (input.value.length === 1 && idx < inputs.length -1) {
					inputs[idx + 1].focus();
				}
			});
			input.addEventListener("keydown", (e) => {
				if (e.key === "Backspace" && input.value === "" && idx > 0) {
					inputs[idx -1].focus();
				}
			});
		});

		const submit = document.getElementById("submitCodeBtn");
		submit?.addEventListener("click", () => twoFa(email));
	} else {
		const submit = document.getElementById("submitAuthAppBtn");
		submit?.addEventListener("click", () => twoFa(email, method));
	}
	document.getElementById("codeDigit0")?.focus();
}