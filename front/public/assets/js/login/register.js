var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createUser } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { render_login } from "../view/render_login.js";
function passwordValidation(password) {
    if (password.length < 8) {
        return { valid: false, error: "Password must be at least 8 characters long." };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, error: "Password must contain at least one uppercase letter." };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, error: "Password must contain at least one lowercase letter." };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, error: "Password must contain at least one number." };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { valid: false, error: "Password must contain at least one special character." };
    }
    if (/\s/.test(password)) {
        return { valid: false, error: "Password cannot contain spaces." };
    }
    return { valid: true };
}
export function registerUser(event) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        event.preventDefault();
        const form = event.target;
        const username = form.elements.namedItem("username").value;
        const email = form.elements.namedItem("email").value;
        const password = form.elements.namedItem("password").value;
        const password2 = form.elements.namedItem("password2").value;
        if (password !== password2) {
            showErrorMessage("Passwords do not match!");
            return;
        }
        const valid = passwordValidation(password);
        if (!valid.valid) {
            showErrorMessage((_a = valid.error) !== null && _a !== void 0 ? _a : "Unknown error");
            return;
        }
        const res = yield createUser(username, email, password);
        if (res.success) {
            showSuccessMessage("Register was succsessfull. Please remember to validate your email adress");
            render_login();
        }
        else {
            showErrorMessage(`Registration failed: ${res.error}`);
        }
    });
}
