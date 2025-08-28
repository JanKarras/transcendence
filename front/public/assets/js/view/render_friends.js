import { bodyContainer, friendsBtn, headernavs, profile, profileContainer, profileImg } from "../constants/constants.js";
import { getAllUser, getUser, handleAcceptRequestApi, handleDeclineRequestApi, logOutApi, removeFriendApi, sendFriendRequestApi } from "../remote_storage/remote_storage.js";
import { showErrorMessage, showSuccessMessage } from "../templates/popup_message.js";
import { isFriendOnline } from "../utils/isFriendOnline.js";
import { render_with_delay } from "../utils/render_with_delay.js";
import { getPos, render_header } from "./render_header.js";
import { lang, t } from "../constants/language_vars.js";
import { LANGUAGE } from "../constants/gloabal.js";
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
    const recv = userData.requests?.received || [];
    const send = userData.requests?.sent || [];
    return {
        allUsers: usersWithoutMe,
        allFriends: sortedFriends,
        onlineFriends,
        recvRequest: recv,
        sendRequest: send
    };
}
export async function render_friends(params) {
    if (!bodyContainer || !profileContainer || !friendsBtn || !headernavs || !profile || !profileImg) {
        showErrorMessage(t(lang.domLoadError, LANGUAGE));
        await logOutApi();
        render_with_delay("login");
        return;
    }
    render_header();
    bodyContainer.innerHTML = "";
    data = await fetchAndPrepareFriendsData();
    console.log(data);
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
        { id: "online", label: t(lang.friendsOnline, LANGUAGE), render: () => renderFriendsOnline(data?.onlineFriends ?? []) },
        { id: "all", label: t(lang.allFriends, LANGUAGE), render: () => renderAllFriends(data?.allFriends ?? []) },
        { id: "add", label: t(lang.addFriends, LANGUAGE), render: () => renderAddFriends(data?.allUsers ?? [], data?.allFriends ?? [], data?.recvRequest ?? [], data?.sendRequest ?? []) },
        { id: "requests", label: t(lang.friendRequests, LANGUAGE), render: () => renderFriendRequests(data?.recvRequest ?? [], data?.sendRequest ?? []) },
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
        nameAge.textContent = `${t(lang.name, LANGUAGE)}: ${fullName.trim() || "-"}`;
    }
    const statsDiv = document.createElement("div");
    statsDiv.innerHTML = `
		${t(lang.wins, LANGUAGE)}: <strong>${friend.wins || 0}</strong>,
		${t(lang.loses, LANGUAGE)}: <strong>${friend.loses || 0}</strong>,
		${t(lang.tournamentWins, LANGUAGE)}: <strong>${friend.tournamentWins || 0}</strong>
	`;
    const btnContainer = document.createElement("div");
    btnContainer.className = "mt-2 flex gap-3";
    const chatBtn = document.createElement("button");
    chatBtn.textContent = `💬 ${t(lang.startChat, LANGUAGE)}`;
    chatBtn.className = "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded";
    chatBtn.addEventListener("click", e => {
        e.stopPropagation();
        console.log(`Chat mit ${friend.username} starten...`);
    });
    const gameBtn = document.createElement("button");
    gameBtn.textContent = `🎮 ${t(lang.startMatch, LANGUAGE)}`;
    gameBtn.className = "bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded";
    gameBtn.addEventListener("click", e => {
        e.stopPropagation();
        console.log(`Spiel-Einladung an ${friend.username} senden...`);
    });
    const removeBtn = document.createElement("button");
    removeBtn.textContent = `🗑 ${t(lang.unfriend, LANGUAGE)}`;
    removeBtn.className = "bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded";
    removeBtn.addEventListener("click", async (e) => {
        e.stopPropagation();
        removeFriend(friend);
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
async function removeFriend(friend) {
    console.log(friend);
    const res = await removeFriendApi(friend);
    if (res.success) {
        showSuccessMessage(t(lang.friendRemoved, LANGUAGE).replace("{username}", friend.username));
    }
    else {
        const errorText = res.error ?? "Unknown Error";
        showErrorMessage(t(lang.friendRemoveFailed, LANGUAGE).replace("{error}", errorText));
    }
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
function renderAddFriendList(container, users, recvRequests, sendRequests) {
    while (container.childNodes.length > 1) {
        container.removeChild(container.lastChild);
    }
    users.forEach(user => {
        const userElement = createAddFriendElement(user, recvRequests, sendRequests);
        container.appendChild(userElement);
    });
}
function renderAddFriends(allUsers, friends, recvRequests, sendRequests) {
    const container = document.getElementById("friends-content");
    if (!container)
        return;
    container.innerHTML = "";
    const friendUsernames = new Set(friends.map(f => f.username));
    // Map username → status für empfangene Freundesanfragen
    const recvFriendStatus = new Map();
    recvRequests
        .filter(r => r.type === "friend")
        .forEach(r => {
        if (r.sender_username)
            recvFriendStatus.set(r.sender_username, r.status);
    });
    // Map username → status für gesendete Freundesanfragen
    const sendFriendStatus = new Map();
    sendRequests
        .filter(r => r.type === "friend")
        .forEach(r => {
        if (r.receiver_username)
            sendFriendStatus.set(r.receiver_username, r.status);
    });
    const nonFriends = allUsers.filter(user => !friendUsernames.has(user.username));
    renderSearchInput(container, (query) => {
        const filtered = nonFriends.filter(user => user.username.toLowerCase().includes(query.toLowerCase()));
        renderAddFriendList(container, filtered, recvFriendStatus, sendFriendStatus);
    });
    renderAddFriendList(container, nonFriends, recvFriendStatus, sendFriendStatus);
}
function createAddFriendElement(user, recvRequests, sendRequests) {
    const userDiv = document.createElement("div");
    userDiv.className =
        "friend-item group flex justify-start items-center border-b border-gray-700 p-2 hover:bg-gray-800 transition";
    const leftDiv = document.createElement("div");
    leftDiv.className = "flex items-center gap-3";
    const imgWrapper = document.createElement("div");
    imgWrapper.className = "relative w-10 h-10 flex-shrink-0";
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
    function mapStatusToText(status) {
        switch (status) {
            case "nothandled":
                return t(lang.status.nothandled, LANGUAGE);
            case "accepted":
                return t(lang.status.accepted, LANGUAGE);
            case "declined":
                return t(lang.status.declined, LANGUAGE);
            default:
                return t(lang.status.unknown, LANGUAGE);
        }
    }
    function mapStatusToClass(status) {
        switch (status) {
            case "nothandled":
                return "text-gray-400 italic";
            case "accepted":
                return "text-green-600 font-semibold";
            case "declined":
                return "text-red-600 font-semibold";
            default:
                return "text-gray-400 italic";
        }
    }
    let statusText = null;
    let statusClass = "";
    if (recvRequests.has(user.username)) {
        const status = recvRequests.get(user.username);
        statusText = mapStatusToText(status);
        statusClass = mapStatusToClass(status);
    }
    else if (sendRequests.has(user.username)) {
        const status = sendRequests.get(user.username);
        statusText = mapStatusToText(status);
        statusClass = mapStatusToClass(status);
    }
    if (statusText) {
        const statusLabel = document.createElement("span");
        statusLabel.textContent = statusText;
        statusLabel.className = `text-sm ml-2 ${statusClass}`;
        leftDiv.appendChild(statusLabel);
        userDiv.appendChild(leftDiv);
    }
    else {
        const addBtn = document.createElement("button");
        addBtn.textContent = `➕ ${t(lang.addFriend, LANGUAGE)}`;
        addBtn.className =
            "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity";
        addBtn.addEventListener("click", async () => {
            sendFriendRequest(user);
        });
        leftDiv.appendChild(addBtn);
        userDiv.appendChild(leftDiv);
    }
    return userDiv;
}
async function sendFriendRequest(user) {
    const res = await sendFriendRequestApi(user);
    if (res.success) {
        showSuccessMessage(t(lang.friendRequestSent, LANGUAGE).replace("{username}", user.username));
    }
    else {
        const errorText = res.error ?? "Unknown Error";
        showErrorMessage(t(lang.friendRequestFailed, LANGUAGE).replace("{error}", errorText));
    }
}
function renderFriendRequests(recvRequests, sendRequests) {
    const container = document.getElementById("friends-content");
    if (!container)
        return;
    container.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "flex gap-8";
    // Links: Empfangene Anfragen
    const recvSection = document.createElement("div");
    recvSection.className = "flex-1";
    recvSection.innerHTML = `<h3 class="font-semibold mb-2">${t(lang.renderFriendRequests.receivedTitle, LANGUAGE)}</h3>`;
    if (recvRequests.length === 0) {
        const noRecv = document.createElement("p");
        noRecv.textContent = t(lang.renderFriendRequests.noReceived, LANGUAGE);
        recvSection.appendChild(noRecv);
    }
    else {
        recvRequests.forEach(request => {
            const requestBox = createRequestBox(request, true, "recv");
            recvSection.appendChild(requestBox);
        });
    }
    // Rechts: Gesendete Anfragen
    const sendSection = document.createElement("div");
    sendSection.className = "flex-1";
    sendSection.innerHTML = `<h3 class="font-semibold mb-2">${t(lang.renderFriendRequests.sentTitle, LANGUAGE)}</h3>`;
    if (sendRequests.length === 0) {
        const noSend = document.createElement("p");
        noSend.textContent = t(lang.renderFriendRequests.noSent, LANGUAGE);
        sendSection.appendChild(noSend);
    }
    else {
        sendRequests.forEach(request => {
            const requestBox = createRequestBox(request, false, "send");
            sendSection.appendChild(requestBox);
        });
    }
    wrapper.appendChild(recvSection);
    wrapper.appendChild(sendSection);
    container.appendChild(wrapper);
}
// Hilfsfunktion, jetzt mit einem zusätzlichen Parameter für Richtung
function createRequestBox(request, canRespond, direction) {
    const requestBox = document.createElement("div");
    requestBox.className = "flex items-center justify-between p-4 mb-3 border rounded shadow";
    const info = document.createElement("div");
    let username = "";
    let text = "";
    if (direction === "recv") {
        username = request.sender_username || t(lang.general.unknownUser, LANGUAGE);
        if (request.type === "friend") {
            text = t(lang.requestBox.friendRequestRecv, LANGUAGE);
        }
        else {
            text = t(lang.requestBox.gameInviteRecv, LANGUAGE);
        }
    }
    else if (direction === "send") {
        username = request.receiver_username || t(lang.general.unknownUser, LANGUAGE);
        if (request.type === "friend") {
            text = t(lang.requestBox.friendRequestSend, LANGUAGE);
        }
        else {
            text = t(lang.requestBox.gameInviteSend, LANGUAGE);
        }
    }
    info.innerHTML = `
		<p class="font-semibold">${username}</p>
		<p class="text-sm text-gray-600">${text}</p>
	`;
    requestBox.appendChild(info);
    function mapStatusToText(status) {
        switch (status) {
            case "nothandled":
                return t(lang.status.nothandled, LANGUAGE);
            case "accepted":
                return t(lang.status.accepted, LANGUAGE);
            case "declined":
                return t(lang.status.declined, LANGUAGE);
            default:
                return t(lang.status.unknown, LANGUAGE);
        }
    }
    // Status-Text & Stil je nach status
    const statusColorMap = {
        nothandled: "text-gray-400 italic",
        accepted: "text-green-600 font-semibold",
        declined: "text-red-600 font-semibold",
    };
    const statusText = mapStatusToText(request.status);
    const statusClass = statusColorMap[request.status] || "text-gray-400 italic";
    if (canRespond) {
        if (request.status === "nothandled") {
            const btns = document.createElement("div");
            btns.className = "flex gap-2";
            const acceptBtn = document.createElement("button");
            acceptBtn.textContent = t(lang.requestBox.accept, LANGUAGE);
            acceptBtn.className = "px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600";
            acceptBtn.addEventListener("click", () => {
                handleAcceptRequest(request);
            });
            const declineBtn = document.createElement("button");
            declineBtn.textContent = t(lang.requestBox.decline, LANGUAGE);
            declineBtn.className = "px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600";
            declineBtn.addEventListener("click", () => {
                handleDeclineRequest(request);
            });
            btns.appendChild(acceptBtn);
            btns.appendChild(declineBtn);
            requestBox.appendChild(btns);
        }
        else {
            const status = document.createElement("span");
            status.className = statusClass;
            status.textContent = statusText;
            requestBox.appendChild(status);
        }
    }
    else {
        const status = document.createElement("span");
        status.className = statusClass;
        status.textContent = statusText;
        requestBox.appendChild(status);
    }
    return requestBox;
}
async function handleAcceptRequest(req) {
    const res = await handleAcceptRequestApi(req);
    if (res.success) {
        showSuccessMessage(t(lang.friendRequestAccepted, LANGUAGE).replace("{username}", req.sender_username || "User"));
    }
    else {
        const errorText = res.error ?? "Unknown Error";
        showErrorMessage(t(lang.friendRequestAcceptFailed, LANGUAGE).replace("{error}", errorText));
    }
}
async function handleDeclineRequest(req) {
    const res = await handleDeclineRequestApi(req);
    if (res.success) {
        showSuccessMessage(t(lang.friendRequestDeclined, LANGUAGE).replace("{username}", req.sender_username || "User"));
    }
    else {
        const errorText = res.error ?? "Unknown Error";
        showErrorMessage(t(lang.friendRequestDeclineFailed, LANGUAGE).replace("{error}", errorText));
    }
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
        renderAddFriends(data.allUsers, data.allFriends, data.recvRequest, data.sendRequest);
    }
    if (currentTab === "requests") {
        renderFriendRequests(data.recvRequest, data.sendRequest);
    }
}, 10000);
