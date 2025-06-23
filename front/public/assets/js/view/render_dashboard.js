import { bodyContainer } from "../constants/constants.js";
import { getUser } from "../remote_storage/remote_storage.js";
export async function render_dashboard(params) {
    if (!bodyContainer) {
        return;
    }
    const user = await getUser();
    console.log(user);
    bodyContainer.innerHTML = 'Dash';
}
