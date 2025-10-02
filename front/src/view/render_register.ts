import { bodyContainer } from "../constants/constants.js";
import { registerUser } from "../login/register.js";
import { navigateTo } from "./history_views.js";
import { render_header } from "./render_header.js";
import { t } from "../constants/i18n.js"

export async function render_register(params: URLSearchParams | null) {
  if (!bodyContainer) {
    return;
  }

  await render_header();

  bodyContainer.innerHTML = `
  <div id="RegContainer" class="max-w-md p-6 bg-white rounded-lg shadow-md text-gray-800">
    <h2 class="text-2xl font-semibold mb-6 text-center">${t('registerTitle')}</h2>
    <form id="registerForm" class="space-y-4">
      <label class="block">
        <span class="block mb-1 font-medium">${t('registerUsername')}</span>
        <input type="text" name="username" required
               class="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <label class="block">
        <span class="block mb-1 font-medium">${t('registerEmail')}</span>
        <input type="email" name="email" required
               class="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <label class="block">
        <span class="block mb-1 font-medium">${t('registerPassword')}</span>
        <input type="password" name="password" required
               class="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <label class="block">
        <span class="block mb-1 font-medium">${t('registerPasswordConfirm')}</span>
        <input type="password" name="password2" required
               class="text-gray-900 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </label>
      <button type="submit"
              class="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition">
        ${t('registerBtn')}
      </button>
    </form>
    <button id="backToLoginBtn"
            class="mt-4 w-full text-indigo-600 hover:text-indigo-800 font-semibold focus:outline-none">
      ${t('backBtn')}
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
