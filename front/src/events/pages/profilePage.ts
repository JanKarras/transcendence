import { createTwoFaApp } from "../../api/createTwoFaApp.js";
import { saveProfileChanges } from "../../api/saveProfileChanges.js";
import { verifyTwoFaCode } from "../../api/verifyTwoFaCode.js";
import { UserInfo } from "../../constants/structs.js";
import { t } from "../../logic/gloabal/initTranslations.js";
import { showErrorMessage } from "../../logic/templates/popupMessage.js";
import { renderProfile, renderTwoFaSettings } from "../../render/pages/renderProfilePage.js";


export async function setEventListenerProfilePage(user: UserInfo) {
	const editBtn = document.getElementById("editBtn");
	const view = document.getElementById("profileView");
	const edit = document.getElementById("profileEdit");
	const cancelBtn = document.getElementById("cancelBtn");
	const form = document.getElementById("editProfileForm") as HTMLFormElement;
	const fileInput = document.getElementById("fileInput") as HTMLInputElement;
	const preview = document.getElementById("profileImagePreview") as HTMLImageElement;
	const matchContainer = document.getElementById("matchHistoryContainer");
	const twofaSettingsBtn = document.getElementById("twofaSettingsBtn");

	twofaSettingsBtn?.addEventListener("click", () => {
		renderTwoFaSettings(user, async () => {
			await renderProfile(null);
		});
	});

	editBtn?.addEventListener("click", () => {
		view?.classList.add("hidden");
		edit?.classList.remove("hidden");
		editBtn?.classList.add("hidden");
		matchContainer?.classList.add("hidden");
	});

	cancelBtn?.addEventListener("click", () => {
		edit?.classList.add("hidden");
		view?.classList.remove("hidden");
		editBtn?.classList.remove("hidden");
		matchContainer?.classList.remove("hidden");
	});

	fileInput?.addEventListener("change", () => {
		const file = fileInput.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			preview.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	});

	form?.addEventListener("submit", async (e: Event) => {
		e.preventDefault();
		const formData = new FormData();

		const inputs = form.querySelectorAll<HTMLInputElement>("input[name]");
		inputs.forEach((input) => {
			if (input.type === "file") return;
			formData.append(input.name, input.value);
		});

		const file = fileInput.files?.[0];
		if (file) formData.append("profileImage", file);

		const res = await saveProfileChanges(formData);
		if (res.success) {
			await renderProfile(null);
		} else {
			showErrorMessage(res.error || t("profileSaveError"));
		}
	});
}

let twoFaVerified = false;

export function setEventListenerTwoFaSettings(backToProfile: () => Promise<void>) {
	const toggle = document.getElementById("toggle2FA") as HTMLInputElement | null;
	const methods = document.getElementById("twofaMethods");
	const emailInput = document.querySelector('input[value="email"]') as HTMLInputElement | null;
	const appInput = document.querySelector('input[value="authapp"]') as HTMLInputElement | null;
	const emailLabelText = document.querySelector("#methodEmailLabel .emailText") as HTMLSpanElement | null;
	const appLabelText = document.querySelector("#methodAppLabel .appText") as HTMLSpanElement | null;
	const qrContainer = document.getElementById("authAppQRContainer") as HTMLDivElement | null;
	const qrImg = document.getElementById("authAppQR") as HTMLImageElement | null;
	const saveBtn = document.getElementById("saveTwoFA");
	const cancelBtn = document.getElementById("cancelTwoFA");
	const verifyBtn = document.getElementById("verifyTwoFaCodeBtn");
	const verifyInput = document.getElementById("twoFaCodeInput") as HTMLInputElement | null;
	const verifyMsg = document.getElementById("twoFaVerifyMessage");

	async function updateMethodStyles() {
		const selected = (document.querySelector('input[name="twofaMethod"]:checked') as HTMLInputElement)?.value;
		if (selected === "email") {
			emailLabelText?.classList.remove("opacity-50");
			appLabelText?.classList.add("opacity-50");
			qrContainer?.classList.add("hidden");
		} else if (selected === "authapp") {
			appLabelText?.classList.remove("opacity-50");
			emailLabelText?.classList.add("opacity-50");
			qrContainer?.classList.remove("hidden");
			if (qrImg) {
				qrImg.src = "";
				const res = await createTwoFaApp();
				if (res.success && res.qrCodeDataUrl) qrImg.src = res.qrCodeDataUrl;
			}
		}
	}

	toggle?.addEventListener("change", () => {
		if (toggle.checked) {
			methods?.classList.remove("opacity-50", "pointer-events-none");
			emailInput!.checked = true;
		} else {
			methods?.classList.add("opacity-50", "pointer-events-none");
			qrContainer?.classList.add("hidden");
		}
		updateMethodStyles();
	});

	emailInput?.addEventListener("change", updateMethodStyles);
	appInput?.addEventListener("change", updateMethodStyles);
	updateMethodStyles();

	saveBtn?.addEventListener("click", async () => {
		const isActive = toggle?.checked ?? false;
		let selected = (document.querySelector('input[name="twofaMethod"]:checked') as HTMLInputElement)?.value || "email";
		if (selected === "authapp" && !twoFaVerified) selected = "email";

		const formData = new FormData();
		formData.append("twofa_active", isActive ? "1" : "0");
		formData.append("twofa_method", isActive ? selected : "");

		const res = await saveProfileChanges(formData);
		if (res.success) {
			await backToProfile();
		} else {
			showErrorMessage(res.error || t("twofaSaveError"));
		}
	});

	cancelBtn?.addEventListener("click", backToProfile);

	verifyBtn?.addEventListener("click", async () => {
		const code = verifyInput?.value.trim();
		if (!code || code.length !== 6) {
			verifyMsg!.textContent = t("twofaCodeInvalid") || "Please enter a 6-digit code.";
			verifyMsg!.className = "text-sm text-red-500";
			return;
		}

		const data = await verifyTwoFaCode(code);
		if (data.success) {
			twoFaVerified = true;
			verifyMsg!.textContent = t("twofaCodeVerified") || "✅ Code verified successfully!";
			verifyMsg!.className = "text-sm text-green-600";
		} else {
			twoFaVerified = false;
			verifyMsg!.textContent = t("twofaCodeWrong") || "❌ Invalid code.";
			verifyMsg!.className = "text-sm text-red-500";
		}
	});
}
