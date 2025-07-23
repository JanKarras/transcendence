import { bodyContainer, friendsBtn, headernavs, profile, profileContainer, profileImg } from "../constants/constants.js";
import { getAllUser, getUser, logOutApi } from "../remote_storage/remote_storage.js";
import { showErrorMessage } from "../templates/popup_message.js";
import { isFriendOnline } from "../utils/isFriendOnline.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { getPos, render_header } from "./render_header.js";
let data = null;
async function fetchAndPrepareFriendsData() {
    const [userData, allUsers] = await Promise.all([getUser(), getAllUser()]);
    if (!userData || !allUsers)
        return null;
    const currentUser = userData.user;
    const allFriends = userData.friends;
    const usersWithoutMe = allUsers.filter(user => user.username !== currentUser.username);
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    const now = Date.now();
    const onlineFriends = allFriends.filter(friend => {
        if (!friend.last_seen)
            return true;
        const lastSeenTime = new Date(friend.last_seen + " UTC").getTime();
        return now - lastSeenTime <= FIVE_MINUTES_MS;
    });
    const sortedFriends = [...allFriends].sort((a, b) => {
        const aOnline = onlineFriends.some(f => f.username === a.username);
        const bOnline = onlineFriends.some(f => f.username === b.username);
        if (aOnline && !bOnline)
            return -1;
        if (!aOnline && bOnline)
            return 1;
        return a.username.localeCompare(b.username);
    });
    return {
        allUsers: usersWithoutMe,
        allFriends: sortedFriends,
        onlineFriends
    };
}
export async function render_friends(params) {
    if (!bodyContainer || !profileContainer || !friendsBtn || !headernavs || !profile || !profileImg) {
        showErrorMessage('Error with DOM loading. You will be logged out. Please try again later');
        await logOutApi();
        render_with_delay("login");
        return;
    }
    render_header();
    bodyContainer.innerHTML = "";
    data = await fetchAndPrepareFriendsData();
    if (!data) {
        return;
    }
    const wrapper = document.createElement("div");
    wrapper.className = "w-full h-full p-10 min-h-[200px]";
    const tabNav = document.createElement("div");
    tabNav.className = "flex gap-4 border-b mb-4";
    const contentContainer = document.createElement("div");
    contentContainer.id = "friends-content";
    const tabs = [
        { id: "online", label: "Freunde Online", render: () => renderFriendsOnline(data?.onlineFriends ?? []) },
        { id: "all", label: "Alle Freunde", render: () => renderAllFriends(data?.allFriends ?? []) },
        { id: "add", label: "Freunde hinzufügen", render: () => renderAddFriends(data?.allUsers ?? [], data?.allFriends ?? []) },
        { id: "requests", label: "Anfragen", render: () => renderFriendRequests() },
    ];
    tabs.forEach((tab, index) => {
        const btn = document.createElement("button");
        btn.textContent = tab.label;
        btn.className = "py-2 px-4 border-b-2 border-transparent hover:border-blue-400 transition";
        if (index === 0)
            btn.classList.add("border-blue-500", "font-semibold");
        btn.addEventListener("click", () => {
            Array.from(tabNav.children).forEach(child => child.classList.remove("border-blue-500", "font-semibold"));
            btn.classList.add("border-blue-500", "font-semibold");
            contentContainer.innerHTML = "";
            contentContainer.setAttribute("data-active-tab", tab.id); // <== HIER!
            tab.render();
        });
        tabNav.appendChild(btn);
    });
    wrapper.appendChild(tabNav);
    wrapper.appendChild(contentContainer);
    bodyContainer.appendChild(wrapper);
    tabs[0].render();
    contentContainer.setAttribute("data-active-tab", "online");
}
function createFriendElement(friend) {
    const isOnline = isFriendOnline(friend);
    const friendDiv = document.createElement("div");
    friendDiv.className = "friend-item border-b border-gray-700 p-2 cursor-pointer";
    const headerDiv = document.createElement("div");
    headerDiv.className = "flex items-center gap-3 relative";
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "relative w-10 h-10";
    const img = document.createElement("img");
    img.src = `/api/get/getImage?filename=${encodeURIComponent(friend.path || "std_user_img.png")}`;
    img.alt = friend.username;
    img.className = "w-10 h-10 rounded-full object-cover";
    const statusDot = document.createElement("span");
    statusDot.className =
        "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-800 " +
            (isOnline ? "bg-green-400" : "bg-green-900");
    imgWrapper.appendChild(img);
    imgWrapper.appendChild(statusDot);
    const usernameSpan = document.createElement("span");
    usernameSpan.textContent = friend.username;
    usernameSpan.className = "font-semibold text-white";
    headerDiv.appendChild(imgWrapper);
    headerDiv.appendChild(usernameSpan);
    friendDiv.appendChild(headerDiv);
    const detailsDiv = document.createElement("div");
    detailsDiv.className = "friend-details mt-2 text-sm text-gray-300 hidden";
    const nameAge = document.createElement("div");
    const fullName = (friend.first_name || "") + (friend.last_name ? " " + friend.last_name : "");
    nameAge.textContent = `Name: ${fullName.trim() || "-"}`;
    if (friend.age !== null && friend.age !== undefined) {
        nameAge.textContent += `, Alter: ${friend.age}`;
    }
    const statsDiv = document.createElement("div");
    statsDiv.innerHTML = `
		Wins: <strong>${friend.wins || 0}</strong>,
		Loses: <strong>${friend.loses || 0}</strong>,
		Tournament Wins: <strong>${friend.tournamentWins || 0}</strong>
	`;
    const btnContainer = document.createElement("div");
    btnContainer.className = "mt-2 flex gap-3";
    const chatBtn = document.createElement("button");
    chatBtn.textContent = "💬 Start Chat";
    chatBtn.className = "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded";
    chatBtn.addEventListener("click", e => {
        e.stopPropagation();
        console.log(`Chat mit ${friend.username} starten...`);
    });
    const gameBtn = document.createElement("button");
    gameBtn.textContent = "🎮 Start Match";
    gameBtn.className = "bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded";
    gameBtn.addEventListener("click", e => {
        e.stopPropagation();
        console.log(`Spiel-Einladung an ${friend.username} senden...`);
    });
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "🗑 Unfriend";
    removeBtn.className = "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded";
    removeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const confirmed = confirm(`Möchtest du ${friend.username} wirklich entfernen?`);
        if (!confirmed)
            return;
    });
    if (isOnline) {
        btnContainer.appendChild(chatBtn);
        btnContainer.appendChild(gameBtn);
    }
    btnContainer.appendChild(removeBtn);
    detailsDiv.appendChild(nameAge);
    detailsDiv.appendChild(statsDiv);
    detailsDiv.appendChild(btnContainer);
    friendDiv.appendChild(detailsDiv);
    friendDiv.addEventListener("click", () => {
        detailsDiv.classList.toggle("hidden");
    });
    return friendDiv;
}
function renderSearchInput(container, onSearch) {
    const searchWrapper = document.createElement("div");
    searchWrapper.className = "mb-4";
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Freund suchen...";
    input.className = "w-full p-2 rounded border border-gray-600 bg-gray-800 text-white";
    input.addEventListener("input", () => {
        onSearch(input.value.trim());
    });
    searchWrapper.appendChild(input);
    container.prepend(searchWrapper);
}
function renderFriendList(container, friends) {
    while (container.childNodes.length > 1) {
        container.removeChild(container.lastChild);
    }
    friends.forEach(friend => {
        const friendElement = createFriendElement(friend);
        container.appendChild(friendElement);
    });
}
function renderFriendsOnline(friends) {
    const container = document.getElementById("friends-content");
    if (!container)
        return;
    container.innerHTML = "";
    renderSearchInput(container, (query) => {
        const filtered = friends.filter(friend => friend.username.toLowerCase().includes(query.toLowerCase()));
        renderFriendList(container, filtered);
    });
    renderFriendList(container, friends);
}
function renderAllFriends(friends) {
    const container = document.getElementById("friends-content");
    if (!container)
        return;
    renderSearchInput(container, (query) => {
        const filtered = friends.filter(friend => friend.username.toLowerCase().includes(query.toLowerCase()));
        renderFriendList(container, filtered);
    });
    renderFriendList(container, friends);
}
function renderAddFriends(allUsers, friends) {
    const container = document.getElementById("friends-content");
    if (!container)
        return;
    container.innerHTML = "";
    const friendUsernames = new Set(friends.map(f => f.username));
    const nonFriends = allUsers.filter(user => !friendUsernames.has(user.username));
    renderSearchInput(container, (query) => {
        const filtered = nonFriends.filter(user => user.username.toLowerCase().includes(query.toLowerCase()));
        renderAddFriendList(container, filtered);
    });
    renderAddFriendList(container, nonFriends);
}
function createAddFriendElement(user) {
    const userDiv = document.createElement("div");
    userDiv.className =
        "friend-item group flex justify-start items-center border-b border-gray-700 p-2 hover:bg-gray-800 transition";
    const leftDiv = document.createElement("div");
    leftDiv.className = "flex items-center gap-3 w-[200px]";
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "relative w-10 h-10";
    const img = document.createElement("img");
    img.src = `/api/get/getImage?filename=${encodeURIComponent(user.path || "std_user_img.png")}`;
    img.alt = user.username;
    img.className = "w-10 h-10 rounded-full object-cover";
    imgWrapper.appendChild(img);
    const usernameSpan = document.createElement("span");
    usernameSpan.textContent = user.username;
    usernameSpan.className = "font-semibold text-white";
    leftDiv.appendChild(imgWrapper);
    leftDiv.appendChild(usernameSpan);
    const addBtn = document.createElement("button");
    addBtn.textContent = "➕ Add Friend";
    addBtn.className =
        "hidden group-hover:inline-block bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm ml-1";
    addBtn.addEventListener("click", async () => {
        console.log(`Freundschaftsanfrage an ${user.username} gesendet.`);
    });
    userDiv.appendChild(leftDiv);
    userDiv.appendChild(addBtn);
    return userDiv;
}
function renderAddFriendList(container, users) {
    while (container.childNodes.length > 1) {
        container.removeChild(container.lastChild);
    }
    users.forEach(user => {
        const userElement = createAddFriendElement(user);
        container.appendChild(userElement);
    });
}
function renderFriendRequests() {
    const container = document.getElementById("friends-content");
    if (!container)
        return;
    container.innerHTML = "<p>Anfragen werden später geladen...</p>";
}
let intervalId;
function findDifferences(obj1, obj2, path = "") {
    const diffs = [];
    if (typeof obj1 !== typeof obj2) {
        diffs.push(`${path}: Type mismatch (${typeof obj1} vs ${typeof obj2})`);
        return diffs;
    }
    if (typeof obj1 !== "object" || obj1 === null || obj2 === null) {
        if (obj1 !== obj2) {
            diffs.push(`${path}: ${obj1} !== ${obj2}`);
        }
        return diffs;
    }
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    for (const key of allKeys) {
        const subPath = path ? `${path}.${key}` : key;
        diffs.push(...findDifferences(obj1[key], obj2[key], subPath));
    }
    return diffs;
}
function deepEqual(a, b) {
    if (a === b)
        return true;
    if (typeof a !== typeof b || a == null || b == null)
        return false;
    if (typeof a === "object") {
        const aKeys = Object.keys(a);
        const bKeys = Object.keys(b);
        if (aKeys.length !== bKeys.length)
            return false;
        for (const key of aKeys) {
            if (!deepEqual(a[key], b[key]))
                return false;
        }
        return true;
    }
    return false;
}
intervalId = setInterval(async () => {
    const pos = getPos();
    if (pos !== 'friends') {
        clearInterval(intervalId);
        return;
    }
    const newData = await fetchAndPrepareFriendsData();
    if (!newData) {
        return;
    }
    if (deepEqual(data, newData)) {
        return;
    }
    console.log("Differences:", findDifferences(data, newData));
    data = newData;
    const currentTab = document.querySelector("#friends-content")?.getAttribute("data-active-tab");
    if (currentTab === "online") {
        renderFriendsOnline(data.onlineFriends);
    }
    if (currentTab === "all") {
        renderAllFriends(data.allFriends);
    }
    if (currentTab === "add") {
        renderAddFriends(data.allUsers, data.allFriends);
    }
    if (currentTab === "requests") {
        renderFriendRequests();
    }
}, 10000);
async function sendFriendRequest() {
}
