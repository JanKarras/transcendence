import { bodyContainer, FRIENDS_CONTAINER_ID, friendsBtn, friendsNumber, headernavs, MENU_CONTAINER_ID, profile, profileContainer, profileImg } from "../constants/constants.js";
import { getUser, logOutApi, saveProfileChanges } from "../remote_storage/remote_storage.js";
import { showFriendsDropdown } from "../templates/freinds_menu.js";
import { buildMenuItems, showMenu } from "../templates/menu.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { removeEventListenerByClone } from "../utils/remove_eventlistener.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { navigateTo } from "./history_views.js";
export async function render_profile_settings(params) {
    if (!bodyContainer || !profile || !headernavs || !profileContainer || !profileImg || !friendsBtn || !friendsNumber) {
        console.error("bodyContainer missing");
        return;
    }
    const userData = await getUser();
    removeEventListenerByClone(MENU_CONTAINER_ID);
    removeEventListenerByClone(FRIENDS_CONTAINER_ID);
    friendsBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        showFriendsDropdown();
    });
    profileContainer.addEventListener("click", (event) => {
        event.stopPropagation();
        const menuItems = buildMenuItems([
            { label: "🏠 Dashboard", onClick: () => navigateTo("dashboard") }
        ]);
        showMenu(menuItems);
    });
    profile.classList.remove('hidden');
    headernavs.classList.remove('hidden');
    if (!userData) {
        showErrorMessage("Database error. You will be logged out");
        await logOutApi();
        render_with_delay("login");
        return;
    }
    const freinds = userData.friends;
    let count = 0;
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const now = Date.now();
    console.log(freinds);
    for (let i = 0; i < freinds.length; i++) {
        const friend = freinds[i];
        if (!friend.last_seen) {
            continue;
        }
        const lastSeen = new Date(friend.last_seen + ' UTC').getTime();
        console.log(lastSeen);
        console.log(now);
        if (now - lastSeen <= FIVE_MINUTES_MS) {
            count++;
        }
    }
    friendsNumber.innerHTML = count.toLocaleString();
    const user = userData.user;
    const safePath = user.path ? `/api/get/getImage?filename=${encodeURIComponent(user.path)}` : './assets/img/default-user.png';
    profileImg.src = safePath;
    profile.innerHTML = user.username;
    const tmp = `<div class="flex flex-col items-center">
					<img src="/api/get/getImage?filename=${encodeURIComponent(user.path)}"
						class="h-32 w-32 rounded-full object-cover shadow-md border border-gray-200 mb-4">
					<h2 class="text-xl font-bold">${user.username}</h2>
					<div class="mt-4 space-y-2 text-center">
						<p><span class="font-semibold">First name:</span> ${user.first_name || 'Unknown'}</p>
						<p><span class="font-semibold">Last name:</span> ${user.last_name || 'Unknown'}</p>
						<p><span class="font-semibold">Age:</span> ${user.age !== null ? user.age : 'Not provided'}</p>
					</div>
				</div>`;
    bodyContainer.innerHTML = `
		<div class="text-black relative max-w-xl w-full mx-auto p-4 bg-white rounded-lg shadow-md">
			<!-- Edit Button -->
			<button id="editBtn" class="absolute top-4 right-6 text-gray-500 hover:text-black transition transform hover:scale-125">
				✏️
			</button>

			<!-- View Mode -->
			<div id="profileView">
				<div class="flex flex-col items-center space-y-4">
					<label class="relative group">
						<img src="${safePath || './assets/img/default-user.png'}"
							class="h-32 w-32 rounded-full object-cover shadow-md border border-gray-200">
					</label>

					<div class="w-full">
						<label class="block text-sm font-medium text-gray-600 mb-1">Username</label>
						<input
							value="${user.username || "Unknown"}"
							disabled
							class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
						/>
					</div>

					<div class="w-full">
						<label class="block text-sm font-medium text-gray-600 mb-1">First Name</label>
						<input
							value="${user.first_name || 'Unknown'}"
							disabled
							class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
						/>
					</div>

					<div class="w-full">
						<label class="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
						<input
							value="${user.last_name || 'Unknown'}"
							disabled
							class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
						/>
					</div>

					<div class="w-full">
						<label class="block text-sm font-medium text-gray-600 mb-1">Age</label>
						<input
							value="${user.age !== null ? user.age : 'Not provided'}"
							disabled
							class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700 appearance-none"
						/>
					</div>
					<div class="min-h-[40px] mt-4"> </div>
				</div>
			</div>

			<!-- Edit Mode -->
			<div id="profileEdit" class="hidden">
				<form id="editProfileForm" class="flex flex-col items-center space-y-4">

					<label for="fileInput" class="cursor-pointer relative group">
						<img id="profileImagePreview" src="${safePath}"
							class="h-32 w-32 rounded-full object-cover shadow-md border border-gray-200">
						<div class="absolute inset-0 rounded-full bg-black bg-opacity-40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
							Change
						</div>
					</label>
					<input type="file" name="profileImage" id="fileInput" accept="image/*" class="hidden">


					<div class="w-full">
						<label class="block text-sm font-medium text-gray-600 mb-1">Username</label>
						<input
							name="username"
							placeholder="Username"
							value="${user.username}"
							required
							class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700 transition hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					<div class="w-full">
						<label class="block text-sm font-medium text-gray-600 mb-1">First Name</label>
						<input
							name="first_name"
							placeholder="First Name"
							value="${user.first_name || ''}"
							class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700 transition hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					<div class="w-full">
						<label class="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
						<input
							name="last_name"
							placeholder="Last Name"
							value="${user.last_name || ''}"
							class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700 transition hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>

					<div class="w-full">
						<label class="block text-sm font-medium text-gray-600 mb-1">Age</label>
						<input
							name="age"
							type="number"
							min="0"
							placeholder="Age"
							value="${user.age || ''}"
							class="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-100 text-gray-700 transition hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
						/>
					</div>
					<div class="flex space-x-4 mt-4">
						<button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
						<button type="button" id="cancelBtn" class="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400">Cancel</button>
					</div>
				</form>
			</div>
		</div>
	`;
    const style = document.createElement("style");
    style.innerHTML = `
		.input {
			@apply w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500;
		}
	`;
    document.head.appendChild(style);
    const editBtn = document.getElementById("editBtn");
    const view = document.getElementById("profileView");
    const edit = document.getElementById("profileEdit");
    const cancelBtn = document.getElementById("cancelBtn");
    const form = document.getElementById("editProfileForm");
    const fileInput = document.getElementById("fileInput");
    const preview = document.getElementById("profileImagePreview");
    editBtn?.addEventListener("click", () => {
        view?.classList.add("hidden");
        edit?.classList.remove("hidden");
        editBtn.classList.add("hidden");
    });
    cancelBtn?.addEventListener("click", () => {
        edit?.classList.add("hidden");
        view?.classList.remove("hidden");
        editBtn?.classList.remove("hidden");
    });
    fileInput?.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                preview.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    });
    form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const res = await saveProfileChanges(formData);
        if (res.success) {
            render_profile_settings(null);
        }
        else {
            showErrorMessage(res.error);
        }
    });
}
