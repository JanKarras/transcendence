import { bodyContainer } from "../../constants/constants.js";
import { t } from "../../logic/global/initTranslations.js";

export async function renderTwoFaPage(email: string | null, method: string | null) {
	if (!bodyContainer) {
		return;
	}

	if (method === "email") {
		bodyContainer.innerHTML = `
			<div id="emailValidationContainer" class="max-w-md p-6 bg-white rounded-lg shadow-lg">
				<h2 class="text-2xl font-bold mb-6 text-center text-gray-800">
					${t("emailTitle2")}
				</h2>

				<p class="mb-4 text-center text-gray-700">
					${t("emailInstruction2")}
					<span class="font-semibold">${email}</span>
				</p>

				<form id="emailValidationForm" class="flex justify-center space-x-2 mb-6">
					${Array(6)
						.fill(0)
						.map(
							(_, i) => `
							<input
								type="text"
								inputmode="numeric"
								maxlength="1"
								pattern="[0-9]"
								required
								class="text-gray-900 w-10 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
								id="codeDigit${i}"
							/>
						`
						)
						.join("")}
				</form>

				<button
					id="submitCodeBtn"
					class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
				>
					${t("emailVerifyBtn2")}
				</button>
			</div>
		`;
	} else {
		bodyContainer.innerHTML = `
			<div id="authAppValidationContainer" class="max-w-md p-6 bg-white rounded-lg shadow-lg text-center">
				<h2 class="text-2xl font-bold mb-6 text-gray-800">
					${t("2faApp.appTitle")}
				</h2>

				<p class="mb-4 text-gray-700">
					${t("2faApp.appInstruction")}
					<span class="font-semibold">${email}</span>
				</p>

				<input
					type="text"
					id="authAppCode"
					inputmode="numeric"
					maxlength="6"
					pattern="[0-9]{6}"
					class="text-gray-900 w-20 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
				/>

				<button
					id="submitAuthAppBtn"
					class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
				>
					${t("2faApp.appVerify")}
				</button>
			</div>
		`;
	}
}
