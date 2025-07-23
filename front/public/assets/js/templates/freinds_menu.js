import { FRIENDS_CONTAINER_ID, friendsNumber } from "../constants/constants.js";
import { getUser, logOutApi } from "../remote_storage/remote_storage.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { navigateTo } from "../view/history_views.js";
import { hideMenu } from "./menu.js";
import { showErrorMessage } from "./popup_message.js";
const FIVE_MINUTES_MS = 5 * 60 * 1000;
export async function showFriendsDropdown() {
    hideMenu();
    const existing = document.getElementById(FRIENDS_CONTAINER_ID);
    if (existing) {
        existing.remove();
    }
    const container = document.createElement("div");
    container.id = FRIENDS_CONTAINER_ID;
    container.className =
        "fixed top-16 right-6 z-50 bg-[#0e0e25] shadow-lg rounded w-[266px] max-h-[400px] opacity-100 translate-y-0 pointer-events-auto transition-all duration-300 flex flex-col";
    const friendsBtn = document.createElement("button");
    friendsBtn.textContent = "👥 Show Friends";
    friendsBtn.className =
        "bg-[#1c1c3a] text-white font-semibold py-2 px-4 rounded-t cursor-pointer hover:bg-[#343465] transition";
    friendsBtn.addEventListener("click", () => {
        navigateTo("friends");
        hideFriendsDropdown();
    });
    container.appendChild(friendsBtn);
    const userData = await getUser();
    if (!userData) {
        showErrorMessage("Error loding friends. You will be logged out");
        await logOutApi();
        render_with_delay("login");
        return;
    }
    const now = Date.now();
    const friends = userData.friends || [];
    const onlineFriends = [];
    const offlineFriends = [];
    for (const friend of friends) {
        const lastSeen = friend.last_seen ? new Date(friend.last_seen + " UTC").getTime() : 0;
        const isOnline = lastSeen && (now - lastSeen <= FIVE_MINUTES_MS);
        if (isOnline)
            onlineFriends.push(friend);
        else
            offlineFriends.push(friend);
    }
    if (friendsNumber) {
        friendsNumber.textContent = onlineFriends.length.toLocaleString();
    }
    const listContainer = document.createElement("div");
    listContainer.className = "overflow-y-auto max-h-[360px] flex-1";
    if (friends.length === 0) {
        listContainer.innerHTML = `<p class="text-white px-4 py-2">Keine Freunde</p>`;
    }
    else {
        [...onlineFriends, ...offlineFriends].forEach((friend) => {
            listContainer.appendChild(renderFriendItem(friend, onlineFriends.includes(friend)));
        });
    }
    container.appendChild(listContainer);
    document.body.appendChild(container);
    function onClickOutside(e) {
        if (!container.contains(e.target)) {
            hideFriendsDropdown();
            document.removeEventListener("click", onClickOutside);
        }
    }
    setTimeout(() => {
        document.addEventListener("click", onClickOutside);
    }, 0);
}
export function hideFriendsDropdown() {
    const container = document.getElementById(FRIENDS_CONTAINER_ID);
    if (container) {
        container.remove();
    }
}
function renderFriendItem(friend, isOnline) {
    const item = document.createElement("div");
    item.className =
        "flex items-center justify-between gap-2 px-4 py-2 hover:bg-gray-100 hover:text-black cursor-pointer text-white transition";
    const left = document.createElement("div");
    left.className = "flex items-center gap-2";
    const img = document.createElement("img");
    img.src = `/api/get/getImage?filename=${encodeURIComponent(friend.path)}`;
    img.alt = friend.username;
    img.className = "w-8 h-8 rounded-full object-cover";
    const name = document.createElement("span");
    name.textContent = friend.username;
    name.className = "font-medium text-sm";
    const status = document.createElement("span");
    status.textContent = isOnline ? "Online" : "Offline";
    status.className = `text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`;
    const textWrapper = document.createElement("div");
    textWrapper.className = "flex flex-col";
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
    return item;
}
