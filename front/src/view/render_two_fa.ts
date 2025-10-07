import { bodyContainer } from "../constants/constants.js";
import { two_fa } from "../login/two_fa.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { render_header } from "./render_header.js";
import { t } from "../constants/i18n.js"

export async function render_two_fa(params: URLSearchParams | null) {
	if (!bodyContainer) {
		return;
	}

	await render_header()

	const email = params?.get('email') || null;

	if (email === null) {
		showErrorMessage("Internal Server error. Please try again later");
		render_with_delay('login');
		return;
	}

	bodyContainer.innerHTML = `
    <div id="emailValidationContainer" class="max-w-md p-6 bg-white rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">${t('emailTitle2')}</h2>
      <p class="mb-4 text-center text-gray-700">
        ${t('emailInstruction2')} <span class="font-semibold">${email}</span>
      </p>
      <form id="emailValidationForm" class="flex justify-center space-x-2 mb-6">
        ${Array(6).fill(0).map((_, i) => `
          <input type="text" inputmode="numeric" maxlength="1" pattern="[0-9]" required
            class="text-gray-900 w-10 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            id="codeDigit${i}" />
        `).join('')}
      </form>
      <button id="submitCodeBtn"
        class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
        ${t('emailVerifyBtn2')}
      </button>
    </div>
  `;

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
	if (submit) {
  	submit.addEventListener("click", () => {
    	two_fa(email);
  	});
	}

  document.getElementById("codeDigit0")?.focus();
}
