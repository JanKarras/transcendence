import { bodyContainer, profile, profileImg } from "../constants/constants.js";
import { getUser, logOutApi } from "../remote_storage/remote_storage.js";
import { showMenu } from "../templates/menu.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { render_with_delay } from "../utils/render_with_delay.js";
export async function render_dashboard(params) {
    if (!bodyContainer || !profile || !profileImg) {
        return;
    }
    profile.classList.remove('hidden');
    const userData = await getUser();
    if (!userData) {
        showErrorMessage("Database error. You will will be logged out");
        await logOutApi();
        render_with_delay("login");
        return;
    }
    const user = userData.user;
    profile.addEventListener("click", (event) => {
        event.stopPropagation();
        showMenu([
            { label: "Profil", onClick: () => console.log("Profil clicked") },
            { label: "Einstellungen", onClick: () => console.log("Einstellungen clicked") },
            { label: "Logout", onClick: () => console.log("Logout clicked") }
        ]);
    });
    console.log(profile);
    console.log(user);
    const freinds = userData.friends;
    const stats = userData.stats;
    profileImg.src = user.path;
    bodyContainer.innerHTML = 'Dash';
}
