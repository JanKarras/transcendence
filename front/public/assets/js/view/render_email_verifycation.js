import { bodyContainer } from "../constants/constants.js";
export function render_email_verification() {
    if (!bodyContainer)
        return;
    bodyContainer.innerHTML = `
		<div id="emailVerificationContainer">
			<h2>Email Verification</h2>
			<p>Please enter the 6-digit code we sent you by email.</p>

			<input type="text" id="verificationCode" maxlength="6" pattern="\\d{6}"
				placeholder="123456" autocomplete="one-time-code"
				style="font-size: 1.5rem; letter-spacing: 0.5rem; text-align: center;" />

			<br /><br />
			<button id="verifyCodeBtn">Verify Code</button>

			<p id="verifyMessage"></p>
		</div>
	`;
    const verifyBtn = document.getElementById("verifyCodeBtn");
    verifyBtn === null || verifyBtn === void 0 ? void 0 : verifyBtn.addEventListener("click", () => {
    });
}
