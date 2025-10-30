import { bodyContainer } from "../../constants/constants.js";
import { t } from "../../logic/gloabal/initTranslations.js";


export async function renderEmailValidation(email : string) {
	if (!bodyContainer) {
		return;
	}

	bodyContainer.innerHTML = `
		<div id="emailValidationContainer" class="max-w-md p-6 bg-white rounded-lg shadow-lg">
		  <h2 class="text-2xl font-bold mb-6 text-center text-gray-800">${t('emailTitle')}</h2>
		  <p class="mb-4 text-center text-gray-700">
			${t('emailInstruction')} <span class="font-semibold">${email}</span>
		  </p>
		  <form id="emailValidationForm" class="flex justify-center space-x-2 mb-6">
			${Array(6).fill(0).map((_, i) => `
			  <input type="text" inputmode="numeric" maxlength="1" pattern="[0-9]" required
				class="text-gray-900 w-10 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
				id="codeDigit${i}" />
			`).join("")}
		  </form>
		  <button id="submitCodeBtn"
			class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
			${t('emailVerifyBtn')}
		  </button>
		</div>
	  `;
}