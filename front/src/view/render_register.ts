import { bodyContainer } from "../constants/constants.js";
import { registerUser } from "../login/register.js";
import { navigateTo } from "./history_views.js";
import { LANGUAGE } from "../constants/gloabal.js";
import { lang, t } from "../constants/language_vars.js";
import { render_header } from "./render_header.js";

export function render_register(params: URLSearchParams | null) {
  if (!bodyContainer) {
    return;
  }

  render_header()

  bodyContainer.innerHTML = `
  <div id="RegContainer" class="max-w-md p-6 bg-white rounded-lg shadow-md text-gray-800">
    <h2 class="text-2xl font-semibold mb-6 text-center">${t(lang.registerTitle, LANGUAGE)}</h2>
    <form id="registerForm" class="space-y-4">
      <label class="block">
        <span class="block mb-1 font-medium">${t(lang.registerUsername, LANGUAGE)}</span>
        <input type="text" name="username" required
               class="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <label class="block">
        <span class="block mb-1 font-medium">${t(lang.registerEmail, LANGUAGE)}</span>
        <input type="email" name="email" required
               class="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <label class="block">
        <span class="block mb-1 font-medium">${t(lang.registerPassword, LANGUAGE)}</span>
        <input type="password" name="password" required
               class="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <label class="block">
        <span class="block mb-1 font-medium">${t(lang.registerPasswordConfirm, LANGUAGE)}</span>
        <input type="password" name="password2" required
               class="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <button type="submit"
              class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
        ${t(lang.registerBtn, LANGUAGE)}
      </button>
    </form>
    <button id="backToLoginBtn"
            class="mt-4 w-full text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none">
      ${t(lang.backBtn, LANGUAGE)}
    </button>
  </div>
  `;

  const backToLoginBtn = document.getElementById("backToLoginBtn");

  if (backToLoginBtn) {
    backToLoginBtn.addEventListener("click", () => {
      navigateTo("login");
    });
  }

  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      registerUser(event);
    });
  }
}
