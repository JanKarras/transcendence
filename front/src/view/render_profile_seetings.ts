import { bodyContainer, headernavs, MENU_CONTAINER_ID, profile, profileContainer } from "../constants/constants.js";
import { UserInfo } from "../constants/structs.js";
import { getUser, logOutApi, saveProfileChanges } from "../remote_storage/remote_storage.js";
import { showMenu, updateMenuItems } from "../templates/menu.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { removeEventListenerByClone } from "../utils/remove_eventlistener.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { navigateTo } from "./history_views.js";

export async function render_profile_settings(params: URLSearchParams | null) {
	if (!bodyContainer || !profile || !headernavs || !profileContainer) {
		console.error("bodyContainer missing");
		return;
	}
	const userData = await getUser();

	removeEventListenerByClone(MENU_CONTAINER_ID);

	profileContainer.addEventListener("click", (event) => {
		event.stopPropagation();
		showMenu([
				{ label: "Dashboard", onClick: () => navigateTo('dashboard') },
				{ label: "Logout", onClick: () => logOutApi() }
			]);
	});

	profile.classList.remove('hidden');
	headernavs.classList.remove('hidden')
	if (!userData) {
		showErrorMessage("Database error. You will be logged out");
		await logOutApi();
		render_with_delay("login");
		return;
	}
	const user: UserInfo = userData.user;
	const tmp = `<div class="flex flex-col items-center">
					<img src="${user.path || './assets/img/default-user.png'}"
						class="h-32 w-32 rounded-full object-cover shadow-md border border-gray-200 mb-4">
					<h2 class="text-xl font-bold">${user.username}</h2>
					<div class="mt-4 space-y-2 text-center">
						<p><span class="font-semibold">First name:</span> ${user.first_name || 'Unknown'}</p>
						<p><span class="font-semibold">Last name:</span> ${user.last_name || 'Unknown'}</p>
						<p><span class="font-semibold">Age:</span> ${user.age !== null ? user.age : 'Not provided'}</p>
					</div>
				</div>`

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
						<img src="${user.path || './assets/img/default-user.png'}"
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
						<img id="profileImagePreview" src="${user.path || './assets/img/default-user.png'}"
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

	// Optional: Tailwind `@apply` Simulation (falls du's nutzt)
	const style = document.createElement("style");
	style.innerHTML = `
		.input {
			@apply w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500;
		}
	`;
	document.head.appendChild(style);

	// DOM Elements
	const editBtn = document.getElementById("editBtn");
	const view = document.getElementById("profileView");
	const edit = document.getElementById("profileEdit");
	const cancelBtn = document.getElementById("cancelBtn");
	const form = document.getElementById("editProfileForm") as HTMLFormElement;
	const fileInput = document.getElementById("fileInput") as HTMLInputElement;
	const preview = document.getElementById("profileImagePreview") as HTMLImageElement;

	editBtn?.addEventListener("click", () => {
		view?.classList.add("hidden");
		edit?.classList.remove("hidden");
		editBtn.classList.add("hidden")
	});

	cancelBtn?.addEventListener("click", () => {
		edit?.classList.add("hidden");
		view?.classList.remove("hidden");
		editBtn?.classList.remove("hidden")
	});

	// Live Preview for new image
	fileInput?.addEventListener("change", () => {
		const file = fileInput.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				preview.src = reader.result as string;
			};
			reader.readAsDataURL(file);
		}
	});

	form?.addEventListener("submit", async (e) => {
		e.preventDefault();

		const formData = new FormData(form);

		const updateData = {
			username: formData.get("username"),
			first_name: formData.get("first_name"),
			last_name: formData.get("last_name"),
			age: formData.get("age") ? parseInt(formData.get("age") as string) : null,
		};

		const imageFile = fileInput?.files?.[0];
		if (imageFile) {
			formData.append("profileImage", imageFile)
		}

		//formData.append("updateData", JSON.stringify(updateData));

		const res = await saveProfileChanges(formData);
		if (res.success) {
			render_profile_settings(null);
		} else {
			showErrorMessage(res.error);
		}
	});


}
