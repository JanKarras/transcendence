import { FRIENDS_CONTAINER_ID, friendsNumber } from "../constants/constants.js";
import { getUser, logOutApi } from "../remote_storage/remote_storage.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { hideMenu } from "./menu.js";
import { showErrorMessage } from "./popup_message.js";
function getOrCreateFriendsContainer() {
    let container = document.getElementById(FRIENDS_CONTAINER_ID);
    if (!container) {
        container = document.createElement("div");
        container.id = FRIENDS_CONTAINER_ID;
        container.className =
            "fixed top-16 right-6 z-50 bg-[#0e0e25] shadow-lg rounded w-[266px] max-h-[400px] opacity-0 translate-y-2 pointer-events-none transition-all duration-300 flex flex-col";
        const fixedBtn = document.createElement("button");
        fixedBtn.textContent = "Friends";
        fixedBtn.className = "bg-[#1c1c3a] text-white font-semibold py-2 px-4 rounded-t cursor-pointer hover:bg-[#343465] transition";
        fixedBtn.style.flex = "0 0 auto";
        fixedBtn.addEventListener("click", () => {
            window.location.href = "/friends-management";
        });
        container.appendChild(fixedBtn);
        // Scrollbarer Bereich für die Freundesliste
        const scrollableFriendsList = document.createElement("div");
        scrollableFriendsList.id = FRIENDS_CONTAINER_ID + "-list";
        scrollableFriendsList.className = "overflow-y-auto max-h-[360px] flex-1";
        container.appendChild(scrollableFriendsList);
        document.body.appendChild(container);
    }
    return container;
}
export async function showFriendsDropdown() {
    hideMenu();
    const container = getOrCreateFriendsContainer();
    const friendsListContainer = document.getElementById(FRIENDS_CONTAINER_ID + "-list");
    friendsListContainer.replaceChildren();
    const userData = await getUser();
    if (!userData) {
        showErrorMessage("Database error. You will will be logged out");
        await logOutApi();
        render_with_delay("login");
        return;
    }
    const friends = userData.friends;
    if (!friends || friends.length === 0) {
        friendsListContainer.innerHTML = `<p class="text-white px-4 py-2">Keine Freunde</p>`;
        return;
    }
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const now = Date.now();
    const online = [];
    const offline = [];
    for (const friend of friends) {
        if (!friend.last_seen) {
            online.push(friend);
            continue;
        }
        const lastSeenTime = new Date(friend.last_seen + " UTC").getTime();
        const diff = now - lastSeenTime;
        if (diff <= FIVE_MINUTES_MS) {
            online.push(friend);
        }
        else {
            offline.push(friend);
        }
    }
    if (friendsNumber) {
        friendsNumber.innerHTML = online.length.toLocaleString();
    }
    const renderFriendItem = (friend, isOnline) => {
        const item = document.createElement("div");
        item.className =
            "flex items-center justify-between gap-2 px-4 py-2 hover:bg-gray-100 hover:text-black cursor-pointer text-white transition";
        const left = document.createElement("div");
        left.className = "flex items-center gap-2";
        const img = document.createElement("img");
        img.src = `/api/get/getImage?filename=${encodeURIComponent(friend.path)}`;
        img.alt = friend.username;
        img.className = "w-8 h-8 rounded-full object-cover";
        const textWrapper = document.createElement("div");
        textWrapper.className = "flex flex-col";
        const name = document.createElement("span");
        name.textContent = friend.username;
        name.className = "font-medium text-sm";
        const status = document.createElement("span");
        status.textContent = isOnline ? "Online" : "Offline";
        status.className = `text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`;
        textWrapper.appendChild(name);
        textWrapper.appendChild(status);
        left.appendChild(img);
        left.appendChild(textWrapper);
        const right = document.createElement("div");
        right.className = "flex items-center gap-2";
        const chatBtn = document.createElement("button");
        chatBtn.innerHTML = "💬";
        chatBtn.className = "hover:scale-110 transition transform";
        chatBtn.title = "Chat starten";
        const playBtn = document.createElement("button");
        playBtn.innerHTML = "🎮";
        playBtn.className = "hover:scale-110 transition transform";
        playBtn.title = "Spiel starten";
        right.appendChild(chatBtn);
        right.appendChild(playBtn);
        item.appendChild(left);
        item.appendChild(right);
        friendsListContainer.appendChild(item);
    };
    online.forEach((f) => renderFriendItem(f, true));
    offline.forEach((f) => renderFriendItem(f, false));
    // Dropdown sichtbar machen
    container.classList.remove("opacity-0", "translate-y-2", "pointer-events-none");
    container.classList.add("opacity-100", "translate-y-0");
    // Click-Outside schließen
    function onClickOutside(event) {
        if (!container.contains(event.target)) {
            hideFriendsDropdown();
            document.removeEventListener("click", onClickOutside);
        }
    }
    setTimeout(() => {
        document.addEventListener("click", onClickOutside);
    }, 0);
}
export function hideFriendsDropdown() {
    const container = getOrCreateFriendsContainer();
    container.classList.add("opacity-0", "translate-y-2", "pointer-events-none");
    container.classList.remove("opacity-100", "translate-y-0");
}
