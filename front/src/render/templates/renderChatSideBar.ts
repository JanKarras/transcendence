import { getBlocked } from "../../api/getBlocked.js";
import { getFreshToken } from "../../api/getFreshToken.js";
import { getMessages } from "../../api/getMessages.js";
import { getStatus } from "../../api/getStatus.js";
import { t } from "../../logic/global/initTranslations.js";
import { currentId, Friend, friendBadgeById, friendElById, friendId, friends, friendStatus, messages, setMessages } from "../../logic/templates/chatSideBarTemplate/chatSidebarTemplateStore.js";
import { addDisappearMessage, addMessageToChat, blockedCheck, blockUser, connectDialog, openProfile, sendChatWsMsg, sendMessage, unblockUser } from "../../logic/templates/chatSideBarTemplate/chatSidebarUtils.js";
import { navigateTo } from "../../router/navigateTo.js";
import { connectChat, getChatSocket } from "../../websocket/wsChatService.js";

export async function getChatSidebarHTML(
	selectedFriend: string | null,
	friends: any[] = []
) {
	return `
		<div class="flex flex-col h-full gap-3 p-4 bg-[#2c2c58] rounded-lg shadow-md">
			<!-- Selected Friend -->
			<div class="flex justify-between items-center">
				<div
					id="chatHeader"
					class="text-xl font-bold bg-gradient-to-br from-[#e100fc] to-[#0e49b0] bg-clip-text text-transparent"
				>
					${selectedFriend || t('selectChatPartner')}
				</div>
				<div id="chatControls" class="flex gap-2"></div>
			</div>

			<!-- Chat Messages -->
			<div
				id="chatMessages"
				class="overflow-y-auto p-3
					bg-gradient-to-r from-[#8e00a8] to-[#7c0bac]
					rounded-lg shadow-[0_0_10px_#174de1]
					mb-2 min-h-[325px] max-h-[325px]"
			>
				<!-- Messages will be injected here -->
			</div>

			<!-- Input -->
			<div class="flex gap-2 mb-2">
				<textarea
					id="chatInput"
					placeholder="${t('enterMessage')}"
					class="flex-1 p-2 rounded-lg border border-gray-200 bg-[#2c2c58] text-white
						focus:outline-none focus:ring-2 focus:ring-[#174de1] resize-none overflow-y-auto"
					rows="1"
				></textarea>
				<button
					id="sendBtn"
					class="px-3 py-2 rounded-lg bg-[#5656aa] text-white hover:bg-[#7878cc] transition
						flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<img class="h-6 w-6" src="./assets/img/send-32.png" alt="Send" />
				</button>
			</div>

			<!-- Friends List -->
			<div class="flex-1 overflow-y-auto">
				<h3 class="text-white font-bold text-lg mb-2">${t('friends')}</h3>
				<ul id="friendsList" class="list-none p-0 space-y-1">
					${friends
						.map(
							(f) => `
						<li class="p-1 text-white cursor-pointer hover:bg-[#3a3a7a] rounded">
							${f.username}
						</li>`
						)
						.join('')}
				</ul>
			</div>
		</div>
	`;
}



export async function renderChatMessages(peerId: number, peerName: string): Promise<void> {
	const chatHeader = document.getElementById('chatHeader') as HTMLElement;
	chatHeader.textContent = `${t('cht.chatWith')} ${peerName}`;

	const chat = document.getElementById('chatMessages') as HTMLElement;
	chat.innerHTML = '';
	const tmpMessages = await getMessages(peerId);
	setMessages(tmpMessages)
	messages.forEach((msg) => {
		const sender = msg.from_username === peerName ? msg.from_username : t('cht.you');

		if (msg.is_read && msg.from_username !== peerName)
			addMessageToChat(sender, msg.content, 0);
		else
			addMessageToChat(sender, msg.content, -1);
	});
}

export async function renderInviteButtons(isInvite: Number): Promise<void> {

	if (isInvite)
	{
		const inviteMode = document.getElementById("inviteModeModalCancel");
		const cancelBtn = document.getElementById("cancelBtnNew");

		inviteMode?.classList.remove("hidden");

		const newCancelBtn = cancelBtn?.cloneNode(true) as HTMLElement;
		cancelBtn?.replaceWith(newCancelBtn);

		const cBtn = document.getElementById("cancelBtnNew");

		cBtn?.addEventListener("click", () => {
			inviteMode?.classList.add("hidden");
			sendMessage(friendId!, t('cht.inviteCancelled'));
			addMessageToChat(t('cht.you'), t('cht.inviteCancelled'), friendStatus);
			const socket = getChatSocket();
			if (socket && socket.readyState === WebSocket.OPEN) {
				sendChatWsMsg('invite_message', {
					to: friendId,
					from: currentId,
					content: 'delete',
				});
			}
		});
	}
	else{
		const inviteMode = document.getElementById("inviteModeModal");
		const startBtn = document.getElementById("startBtn");
		const cancelBtn = document.getElementById("cancelBtn");

		inviteMode?.classList.remove("hidden");

		const newStartBtn = startBtn?.cloneNode(true) as HTMLElement;
		const newCancelBtn = cancelBtn?.cloneNode(true) as HTMLElement;
		startBtn?.replaceWith(newStartBtn);
		cancelBtn?.replaceWith(newCancelBtn);

		const sBtn = document.getElementById("startBtn");
		const cBtn = document.getElementById("cancelBtn");

		sBtn?.addEventListener("click", async () => {
			const token = await getFreshToken();
			const socket = getChatSocket();
			if (socket && socket.readyState === WebSocket.OPEN) {
				sendChatWsMsg('invite_message', {
					to: friendId,
					from: currentId,
					content: 'accept',
				});
			}

			const p = new URLSearchParams();
			p.set("mode", "remote");
			p.set("via", "invite");
			inviteMode?.classList.add("hidden");
			setTimeout(() => {
			navigateTo("game", p);
			},500);
		});

		cBtn?.addEventListener("click", () => {
			inviteMode?.classList.add("hidden");
			sendMessage(friendId!, t('cht.inviteCancelled'));
			addMessageToChat(t('cht.you'), t('cht.inviteCancelled'), friendStatus);
			const socket = getChatSocket();
			if (socket && socket.readyState === WebSocket.OPEN) {
				sendChatWsMsg('invite_message', {
					to: friendId,
					from: currentId,
					content: 'delete',
				});
			}
		});
	}
}

export async function renderFriendsList(friends: Friend[]): Promise<void> {
	const list = document.getElementById('friendsList') as HTMLUListElement;
	list.innerHTML = '';
	friendElById.clear();

	const statuses = await Promise.all(
		friends.map((f) => getStatus(f.id).catch(() => 0))
	);

	friends.forEach((friend, i) => {
		const li = document.createElement('li');
		li.className = 'flex items-center gap-2 p-2 rounded hover:bg-[#1a1a3d]';
		const key = String(friend.id);
		li.dataset.id = key;
		li.dataset.name = friend.username;

		const avatarWrapper = document.createElement('div');
		avatarWrapper.className = 'relative w-8 h-8';

		const avatar = document.createElement('img');
		avatar.src = `/api/get/getImage?filename=${encodeURIComponent(friend.path || "std_user_img.png")}`;
		avatar.alt = friend.username;
		avatar.className = 'w-8 h-8 rounded-full object-cover cursor-pointer';

		avatar.onclick = async () => {
			if (await blockedCheck(friend.id)) return;
			const chatMessages = document.getElementById("chatMessages");
			if (chatMessages) {
			chatMessages.scrollTop = 0;
			}
			openProfile(friend.id);
		};
		friend.online = statuses[i] ? true : false ;
		const isOnline = statuses[i] === 1;
		const statusDot = document.createElement('span');
		statusDot.className = `w-3 h-3 rounded-full border-2 border-[#0f0f2a] absolute bottom-0 right-0 ${
			isOnline ? 'bg-green-400' : 'bg-green-900'
		}`;

		avatarWrapper.appendChild(avatar);
		avatarWrapper.appendChild(statusDot);

		const nameSpan = document.createElement('span');
		nameSpan.className = 'friend-name text-white cursor-pointer';
		nameSpan.textContent = friend.username;
		nameSpan.onclick = () => connectDialog(friend.id, friend.username);

		const badge = document.createElement('span');
		badge.dataset.id = key;
		badge.className = 'unread-badge ml-auto';
		badge.textContent = friend.has_unread ? '📩' : '';
		friendBadgeById.set(key, badge);

		li.appendChild(avatarWrapper);
		li.appendChild(nameSpan);
		li.appendChild(badge);

		list.appendChild(li);
		friendElById.set(key, li);
	});
}

export async function renderChatControls(peerId: number, peerName: string): Promise<void> {
	const chatControls = document.getElementById('chatControls') as HTMLDivElement;
	chatControls.innerHTML = '';

	const isBlocked = await getBlocked(peerId);

	const blockBtn = document.createElement('button');
	if (isBlocked === 1 || isBlocked === 3) {
		blockBtn.textContent = '🔓';
		blockBtn.title = t('cht.unblock');
		blockBtn.onclick = async () => {
			await unblockUser(peerId);
			await connectDialog(peerId, peerName);
		};
	} else {
		blockBtn.textContent = '🚫';
		blockBtn.title = t('cht.block');
		blockBtn.onclick = async () => {
			await blockUser(peerId);
			await connectDialog(peerId, peerName);
		};
	}
	chatControls.appendChild(blockBtn);

	const inviteBtn = document.createElement('button');
	inviteBtn.textContent = '🎮';
	inviteBtn.title = t('cht.inviteToGame');
	const friend = friends.find(f => f.id === peerId);
	inviteBtn.onclick = async () => {
		if (!friendId || await blockedCheck(friendId)) return;
		if (!friend?.online) {
			addDisappearMessage("❌ " + peerName + t('cht.notOnline'));
			return;
		}
		else if (friendStatus === 0) {
			 addDisappearMessage("❌ " + peerName + t('cht.inAnotherChat'));
			return;
		}

		await inviteFriend(friendId, peerName);
	};
	chatControls.appendChild(inviteBtn);
}

async function inviteFriend(inviterId: number, username : string): Promise<void>{

	if (await blockedCheck(inviterId)) return;

	const socket = await getChatSocket();

	if (socket && socket.readyState === WebSocket.OPEN) {
		addMessageToChat(t('cht.you'), t('cht.inviteSent'), friendStatus);
		sendMessage(inviterId, t('cht.inviteSent'));
		sendChatWsMsg('invite_message', {
			to: inviterId,
			from: currentId,
			fromUsername: username,
			content: 'sent',
		});

		renderInviteButtons(1);

	} else if (!socket || socket.readyState !== WebSocket.OPEN) {
		const token = localStorage.getItem('auth_token');
		if (token) {
			connectChat();
			const chat = document.getElementById('chatMessages') as HTMLElement;
			chat.innerHTML = t('cht.reconnecting');
			addMessageToChat('', t('cht.retryInvite'), -1);
		}
	}
}
