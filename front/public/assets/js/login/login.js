var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { two_fa } from "../index/two_fa.js";
import { logInApi } from "../remote_storage/remote_storage.js";
import { render_two_fa } from "../view/two_fa.js";
export function logIn(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.target;
        const username = form.elements.namedItem("user").value;
        const password = form.elements.namedItem("password").value;
        const res = yield logInApi(username, password);
        if (res.success) {
            console.log(`User "${username}" logged in successfully.`);
            two_fa();
            render_two_fa();
        }
        else {
            console.error('Login failed:', res.error);
            alert(`Login failed: ${res.error}`);
        }
    });
}
