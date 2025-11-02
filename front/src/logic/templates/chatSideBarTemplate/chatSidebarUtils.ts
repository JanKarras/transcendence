import { getBlocked } from "../../../api/getBlocked.js";
import { getFriends } from "../../../api/getFriends.js";
import { getMessages } from "../../../api/getMessages.js";
import { renderChatControls, renderChatMessages, renderFriendsList } from "../../../render/templates/renderChatSideBar.js";
import { renderProfile } from "../../../render/templates/renderProfile.js";
import { connectChat, getChatSocket } from "../../../websocket/wsChatService.js";
import { t } from "../../gloabal/initTranslations.js";
import { friendId, friends, friendStatus, messages, setFriendId, setFriends, setMessages } from "./chatSidebarTemplateStore.js";

export function sendChatWsMsg(type: string, payload: Record<string, any>): void {
	const socket = getChatSocket();

	if (!socket || socket.readyState !== WebSocket.OPEN) {
		console.warn(`❌ WebSocket not ready. Cannot send ${type}`);
		return;
	}

	const message = { type, data: payload };
	console.log('➡️ Sending message:', message);
	socket.send(JSON.stringify(message));
}


export function addMessageToChat(
	from: string,
	content: string,
	friendStatus: number
): void {
	const chat = document.getElementById('chatMessages') as HTMLElement;
	const div = document.createElement('div');
	let str: string = ':';
	if (from === '') str = '';
	if (friendStatus === 0) div.className = 'bg-gray-500';

	div.textContent = `${from}${str} ${content}`;
	chat.appendChild(div);
	chat.scrollTop = chat.scrollHeight;
}

export async function refreshDialog(friendId: number) {
	const friend = friends.find((f) => f.id === friendId);
	if (!friend) return;

	const blocked = await getBlocked(friendId);
	if (blocked === 2) return;

	await renderChatMessages(friend.id, friend.username);
}

export function addDisappearMessage(content: string): void {
	const chat = document.getElementById('chatMessages') as HTMLElement;
	const div = document.createElement('div');
	div.textContent = content;
	div.className = 'italic';
	chat.appendChild(div);
	chat.scrollTop = chat.scrollHeight;
	console.log('inviteCheckStatus === ', content);
	setTimeout(() => {
		div.remove();
	}, 2000);
}

export async function retryMessage(friendId: number | null, content: string) {
	if (friendId === null) return;
	const socket = await getChatSocket();
	const ok = await ensureConnected();
	if (!ok || !socket) {
		addDisappearMessage(t('cht.deliveryFail'));
		return;
	}
	sendMessage(friendId, content);
}

export async function ensureConnected(timeout = 3000): Promise<boolean> {
	const socket = await getChatSocket();

	if (socket && socket.readyState === WebSocket.OPEN) return true;

	const NewSocket = await connectChat();

	try {
		await waitForSocketOpen(NewSocket!, timeout);
		return true;
	} catch {
		console.warn('❌ WebSocket still not connected after retry.');
		return false;
	}
}

export function waitForSocketOpen(socket: WebSocket, timeout = 2000): Promise<void> {
	return new Promise((resolve, reject) => {
		if (socket.readyState === WebSocket.OPEN) {
			resolve();
			return;
		}

		const timer = setTimeout(() => {
			reject(new Error('WebSocket did not open in time'));
		}, timeout);

		socket.addEventListener('open', () => {
			clearTimeout(timer);
			resolve();
		});
	});
}

export async function sendMessage(friendId: number, content: string) {
	if (!content) return;

	const ok = await ensureConnected();

	const socket = await getChatSocket();

	if (!ok || !socket) {
		addDisappearMessage(t('cht.noToken'));
		return;
	}

	sendChatWsMsg('send_message', { friendId, content });
}

export async function refreshFriendsList(): Promise<void> {
	const tmpFriends = await getFriends();
	setFriends(tmpFriends);
	renderFriendsList(tmpFriends);
}

export async function blockedCheck(friendId: number): Promise<number> {
	const temp = await getBlocked(friendId);
	if (temp === 2 || temp === 3) {
		addDisappearMessage(t('cht.blockedYou'));
		return 2;
	}
	else if (temp === 1){
		addDisappearMessage(t('cht.userBlocked'));
		return 1;
	}
	return 0;
}

export async function openProfile(userId: number): Promise<void> {
	const friend = friends.find(f => f.id === userId);

	const chat = document.getElementById("chatMessages") as HTMLElement;
	chat.innerHTML = "";

	const fakeBodyContainer = document.createElement("div");
	fakeBodyContainer.id = "bodyContainer";
	chat.appendChild(fakeBodyContainer);
	await renderProfile(friend as any, userId, chat);
}

export async function friendChat(content: string) {
	if (friendId) {
		if (await blockedCheck(friendId)) {
			return;
		}
		sendMessage(friendId, content);
		addMessageToChat(t('cht.you'), content, friendStatus);
	} else {
		const chat = document.getElementById('chatMessages') as HTMLElement;
		chat.innerHTML = '';
		addDisappearMessage(t('cht.selectChatPartner'));
	}
}

export async function connectDialog(
	peerId: number,
	peerName: string
): Promise<void> {

	if(peerName === '')
	{
		const friend = friends.find(f => f.id === peerId);
		if (friend) {
			peerName = friend.username;
		} else {
			console.log('Friend with this ID not found');
		}
	}
	if (friendId && friendId !== peerId) {
		sendconnect(friendId, '2');
	}
	setFriendId(peerId);

	const chat = document.getElementById('chatMessages') as HTMLElement;
	chat.innerHTML = '';

	try {
		const socket = await getChatSocket();
		if (!socket || socket.readyState !== WebSocket.OPEN) {
			const token = localStorage.getItem('auth_token');
			if (!token) throw new Error('No token');

			await connectChat();

		}

		if (!socket) throw new Error('No socket');

		await waitForSocketOpen(socket);

		const tmpMessages = await getMessages(peerId);

		setMessages(tmpMessages)

		if (friendId && await getBlocked(friendId) !== 3 && messages) {
			if(messages[messages.length - 1].is_read === 1) {sendconnect(friendId, '4');}
			else sendconnect(friendId, '1');
			refreshFriendsList();
		}
	} catch (err) {
		console.log('❌ Message not sent: WebSocket not connected.');
	}


	const chatControls = document.getElementById('chatControls') as HTMLDivElement;
	chatControls.innerHTML = '';

	await renderChatControls(peerId, peerName);
	const res = await getBlocked(friendId);

	if (res === 2 || res === 3) {
			addDisappearMessage(t('cht.blockedYou'));
			console.log('blockedCheck(friendId) === ', res);
			const chatHeader = document.getElementById('chatHeader') as HTMLElement;
			chatHeader.textContent = `${t('cht.chatWith')} ${peerName}`;
			return;
	}
	if (!messages) return;
	await renderChatMessages(peerId, peerName);

}

export async function sendconnect(friendId: number, content: string) {
	const socket = await getChatSocket();
	if (socket && socket.readyState === WebSocket.OPEN) {
		sendChatWsMsg('dialog_open', { friendId, content });
	} else if (!socket || socket.readyState !== WebSocket.OPEN) {
		console.warn('❌ WebSocket disconnected');
	}
}

export async function blockUser(id: number) {
	return toggleBlockUser(id, 'block');
}

export async function unblockUser(id: number) {
	return toggleBlockUser(id, 'unblock');
}

export async function toggleBlockUser(
	targetId: number,
	action: 'block' | 'unblock'
) {
	const socket = await getChatSocket();
	const msg = action === 'block' ? t('cht.retryBlock') : t('cht.retryUnblock');
	if (!socket || socket.readyState !== WebSocket.OPEN) {
		const token = localStorage.getItem('auth_token');
		if (token) {
			connectChat();
			const chat = document.getElementById('chatMessages') as HTMLElement;
			chat.innerHTML = t('cht.reconnecting');
			addMessageToChat('', msg, -1);
		}
		return;
	}

	if (!friendId || friendId !== targetId) {
		const chat = document.getElementById('chatMessages') as HTMLElement;
		chat.innerHTML = t('cht.userSwitched');
		addMessageToChat('', msg, -1);
		setTimeout(() => connectDialog(targetId, ''), 2500);
		return;
	}

	const label = action === 'block' ? t('cht.blocked') : t('cht.unblocked');
	sendMessage(targetId, label);
	console.log("Satatus Block = ", await getBlocked(friendId));
	if (await getBlocked(friendId) === 2) {
		addDisappearMessage(label);
	} else {
		addMessageToChat(t('cht.you'), label, friendStatus);
	}

	sendChatWsMsg('blocked', { blockedId: targetId, content: action });
}

export async function closeDialog() {
	setFriendId(0);
	const chatHeader = document.getElementById('chatHeader') as HTMLElement;
	if (chatHeader) chatHeader.textContent = t('cht.selectChatPartner');
	const chat = document.getElementById('chatMessages') as HTMLElement;
	if (chat) chat.innerHTML = t('cht.leftChat');
	const chatControls = document.getElementById('chatControls') as HTMLDivElement;
	if (chatControls) chatControls.innerHTML = '';
	const inviteMode = document.getElementById("inviteModeModal");
	if (inviteMode) inviteMode?.classList.add("hidden");
	const inviteModeCancel = document.getElementById("inviteModeModalCancel");
	if (inviteModeCancel) inviteModeCancel?.classList.add("hidden");
}