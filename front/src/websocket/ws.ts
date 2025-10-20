import {
    getMessages,
    getBlocked,
    getFriends,
    getStatus,
    getFreshToken,
} from '../remote_storage/remote_storage.js';
import { renderProfile } from '../view/render_friend_profile.js';
import { t } from "../constants/i18n.js";
import { navigateTo } from "../view/history_views.js";


let socket: WebSocket | null = null;
let friendStatus = -1;
let currentId: number | null = null;
let friendId: number | null = null;

let friends: Friend[] = [];
let messages: Message[] = [];

const friendElById = new Map<string, HTMLLIElement>();
const friendBadgeById = new Map<string, HTMLSpanElement>();

interface Friend {
    id: number;
    username: string;
    online: boolean;
    blocked: boolean;
    has_unread: number;
	path: string;
}

interface Message {
    from_username: string;
    content: string;
    is_read: number;
    is_invite: number;
}

export async function connectWebSocket() {

    if (socket && socket.readyState === WebSocket.OPEN) return;

    const token = await getFreshToken();
    if (!token) {
        console.warn('WebSocket: No auth token found in cookies.');
    }

    const wsUrl = `wss://${location.host}/ws/chat?token=${token}`;

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
       
        console.log("open soket");
        sendWS('dialog_open', { friendId, content: "4"});
   
    };

    socket.onmessage = (event) => {
        let msg: any;
    try {
        msg = JSON.parse(event.data);
    } catch {
        return;
    }

    switch (msg.type) {
        case 'init': 
            handleInit(msg);
            break;

        case 'chat': 
            handleChat(msg);
            break;

        case 'chat-block': 
            handleChatBlock(msg);
            break;

        case 'read_receipt': 
            handleReadReceipt(msg);
            break;

        case 'peer_dialog_open': 
            handlePeerDialogOpen(msg);
            break;

        case 'friend_status': 
            handleFriendStatus(msg);
            break;

        case 'new_message':
            handleNewMassage(msg);
            break;

        case 'invite_message': 
            handleInviteMessage(msg);
            break;
    }
    };

    socket.onclose = (ev) => {
        console.warn('🔌 WebSocket disconnected client');
        socket = null;
        closeDialog();
    };

    socket.onerror = (err) => {
        console.error('⚠️ WebSocket error:', err);
    };
}

function handleInit(msg: any) {
    currentId = msg.senderId;
    console.log('🔌 WebSocket connected', currentId);
}

function handleChat(msg: any) {
    const { friendId: userId, senderName: name, content } = msg;
    if (userId === currentId && friendId) {
        addMessageToChat(name, content, friendStatus);
    }
}

function handleChatBlock(msg: any) {
    const { friendId: userId, senderName: name, content } = msg;
    console.log("Content12, friend, userid",content, friendId, userId);
    if (content === 'unblock' && friendId) {
        refreshDialog(friendId);
        return;
    }

    if (content === 'block' && userId === currentId) {
        const newContent = t('cht.blocked_you');
        if (socket && socket.readyState === WebSocket.OPEN) {
            const chat = document.getElementById('chatMessages') as HTMLElement;
            chat.innerHTML = '';
            addDisappearMessage(name + ': ' + newContent);
        } else {
            console.warn('❌ WebSocket not connected, trying to reconnect...');
            retryMessage(friendId, newContent);
        }
    }
}

function handleReadReceipt(msg: any) {
    
    if (msg.readerId === friendId) {
        friendStatus = msg.content === '1' ? 1 : 0;
    }
    if (msg.content === '2') friendStatus = 0;

}

function handlePeerDialogOpen(msg: any) {
    if (friendId && msg.peerId === friendId) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log('peer_dialog_open');
            refreshDialog(friendId);
        }
    }
}

function handleFriendStatus(msg: any) {
    const key = String(msg.userId);
    const li = friendElById.get(key);
    const friend = friends.find(f => f.id === msg.userId);
    
    if (!li) return;

    const avatarWrapper = li.querySelector<HTMLDivElement>('.relative');
    if (!avatarWrapper) return;

    const statusDot = avatarWrapper.querySelector<HTMLSpanElement>('span');
    if (!statusDot) return;

    const online = Number(msg.status);

    if (friend) friend.online = online === 1;

    statusDot.className = `w-3 h-3 rounded-full border-2 border-[#0f0f2a] absolute bottom-0 right-0 ${
        online === 1 ? 'bg-green-400' : 'bg-green-900'
    }`;
}

function handleNewMassage(msg: any) {
    const key = String(msg.userId);
    const badge = friendBadgeById.get(key);
    if (!badge || msg.friendId !== currentId) return;
    const has_unread = Number(msg.status);
    badge.textContent = has_unread ? ' 📩' : '';
}

function handleInviteMessage(msg: any) {
    const { friendId: userId, content } = msg;
    if (content === 'delete' && friendId) {
        const inviteMode = document.getElementById("inviteModeModal");
        const inviteModeCancel = document.getElementById("inviteModeModalCancel");
        inviteModeCancel?.classList.add("hidden");
        inviteMode?.classList.add("hidden");
        return;
    }
    if (content === 'accept'){
        
        
        const p = new URLSearchParams();
        p.set("mode", "remote");
        const inviteModeCancel = document.getElementById("inviteModeModalCancel");
        inviteModeCancel?.classList.add("hidden");
        console.log("🚦 Навигация в игру");
        navigateTo("game", p);
        
        
        
    }
    if (userId === currentId && content === 'sent') {
        renderInviteButtons(0);
    }
}

async function closeDialog() {
    friendId = 0;
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

async function blockedCheck(friendId: number): Promise<number> {
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

export async function blockUser(id: number) {
    return toggleBlockUser(id, 'block');
}

export async function unblockUser(id: number) {
    return toggleBlockUser(id, 'unblock');
}

async function toggleBlockUser(
    targetId: number,
    action: 'block' | 'unblock'
) {
    
    const msg = action === 'block' ? t('cht.retryBlock') : t('cht.retryUnblock');
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        const token = localStorage.getItem('auth_token');
        if (token) {
            connectWebSocket();
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
        addMessageToChat('You', label, friendStatus);
    }

    sendWS('blocked', { blockedId: targetId, content: action });
}

async function retryMessage(friendId: number | null, content: string) {
    if (friendId === null) return;
    const ok = await ensureConnected();
    if (!ok || !socket) {
        addDisappearMessage(t('cht.deliveryFail'));
        return;
    }
    sendMessage(friendId, content);
}

async function renderChatMessages(peerId: number, peerName: string): Promise<void> {
    const chatHeader = document.getElementById('chatHeader') as HTMLElement;
    chatHeader.textContent = `${t('cht.chatWith')} ${peerName}`;

    const chat = document.getElementById('chatMessages') as HTMLElement;
    chat.innerHTML = '';
    console.log("friendstatus masage", friendStatus);
    messages = await getMessages(peerId);
    messages.forEach((msg) => {
        const sender = msg.from_username === peerName ? msg.from_username : t('cht.you');

        if (msg.is_read && msg.from_username !== peerName)
            addMessageToChat(sender, msg.content, 0);
        else
            addMessageToChat(sender, msg.content, -1);
    });
}

async function refreshDialog(friendId: number) {
    const friend = friends.find((f) => f.id === friendId);
    if (!friend) return;

    const blocked = await getBlocked(friendId);
    if (blocked === 2) return;

    await renderChatMessages(friend.id, friend.username);
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

export async function sendMessage(friendId: number, content: string) {
    if (!content) return;

    const ok = await ensureConnected();

    if (!ok || !socket) {
        addDisappearMessage(t('cht.noToken'));
        return;
    }

    sendWS('send_message', { friendId, content });
}

function sendWS(type: string, payload: Record<string, any>): void {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn(`❌ WebSocket not ready. Cannot send ${type}`);
        return;
    }

    const message = { type, ...payload };
    socket.send(JSON.stringify(message));
}

async function ensureConnected(timeout = 3000): Promise<boolean> {
    if (socket && socket.readyState === WebSocket.OPEN) return true;

    await connectWebSocket();

    try {
        await waitForSocketOpen(socket!, timeout);
        return true;
    } catch {
        console.warn('❌ WebSocket still not connected after retry.');
        return false;
    }
}

function waitForSocketOpen(socket: WebSocket, timeout = 2000): Promise<void> {
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

async function renderChatControls(peerId: number, peerName: string): Promise<void> {
    const chatControls = document.getElementById('chatControls') as HTMLDivElement;
    chatControls.innerHTML = '';

    const isBlocked = await getBlocked(peerId);
    console.log('isBlocked = ', isBlocked);

    const blockBtn = document.createElement('button');
    if (isBlocked === 1 || isBlocked === 3) {
        blockBtn.textContent = '🔓';
        blockBtn.title = t('cht.unblock');
        blockBtn.onclick = async () => {
            await unblockUser(peerId);
            await connectDialog(peerId, peerName); // Обновим интерфейс
        };
    } else {
        blockBtn.textContent = '🚫';
        blockBtn.title = t('cht.block');
        blockBtn.onclick = async () => {
            // if(await inviteCheckStatus(peerId)) return;
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
            //console.log("He ist not online", friend?.online, friend)
            addDisappearMessage("❌ " + peerName + " ist not online");
            return;
        }
        else if (friendStatus === 0) {
             addDisappearMessage("❌ " + peerName + " in another chat");
            return;
        }
        
        await inviteFriend(friendId, peerName);
    };
    chatControls.appendChild(inviteBtn);
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
    friendId = peerId;
    
    const chat = document.getElementById('chatMessages') as HTMLElement;
    chat.innerHTML = '';
    
    try {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error('No token');

            await connectWebSocket();
            
        }

        if (!socket) throw new Error('No socket');

        await waitForSocketOpen(socket);
        
        messages = await getMessages(friendId);
        
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
            //const chat = document.getElementById('chatMessages') as HTMLElement;
            return;
    }
    if (!messages) return;
    await renderChatMessages(peerId, peerName);

}

async function sendconnect(friendId: number, content: string) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        sendWS('dialog_open', { friendId, content });
    } else if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn('❌ WebSocket disconnected');
    }
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

    // Avatar Wrapper (relative)
    const avatarWrapper = document.createElement('div');
    avatarWrapper.className = 'relative w-8 h-8';

    // Avatar
    const avatar = document.createElement('img');
    avatar.src = `/api/get/getImage?filename=${encodeURIComponent(friend.path || "std_user_img.png")}`;
    avatar.alt = friend.username;
    avatar.className = 'w-8 h-8 rounded-full object-cover cursor-pointer';

    // Klick aufs Avatar öffnet Profil
    avatar.onclick = async () => {
        if (await blockedCheck(friend.id)) return;
        openProfile(friend.id);
    };

    // Online-Punkt (absolute)
    friend.online = statuses[i] ? true : false ;
    const isOnline = statuses[i] === 1;
    const statusDot = document.createElement('span');
    statusDot.className = `w-3 h-3 rounded-full border-2 border-[#0f0f2a] absolute bottom-0 right-0 ${
        isOnline ? 'bg-green-400' : 'bg-green-900'
    }`;

    avatarWrapper.appendChild(avatar);
    avatarWrapper.appendChild(statusDot);

    // Name
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

export async function refreshFriendsList(): Promise<void> {
    friends = await getFriends();
    renderFriendsList(friends);
}

async function inviteFriend(inviterId: number, username : string): Promise<void>{

    if (await blockedCheck(inviterId)) return;

    if (socket && socket.readyState === WebSocket.OPEN) {
        addMessageToChat(t('cht.you'), t('cht.inviteSent'), friendStatus);
        sendMessage(inviterId, t('cht.inviteSent'));
        sendWS('invite_message', {
            to: inviterId,
            from: currentId,
            fromUsername: username,
            content: 'sent',
        });

        renderInviteButtons(1);

    } else if (!socket || socket.readyState !== WebSocket.OPEN) {
        const token = localStorage.getItem('auth_token');
        if (token) {
            connectWebSocket();
            const chat = document.getElementById('chatMessages') as HTMLElement;
            chat.innerHTML = t('cht.reconnecting');
            addMessageToChat('', t('cht.retryInvite'), -1);
        }
    }
}

async function renderInviteButtons(isInvite: Number): Promise<void> {

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
            addMessageToChat('You', t('cht.inviteCancelled'), friendStatus);
            if (socket && socket.readyState === WebSocket.OPEN) {
                sendWS('invite_message', {
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

        sBtn?.addEventListener("click", () => {
            if (socket && socket.readyState === WebSocket.OPEN) {
                sendWS('invite_message', {
                    to: friendId,
                    from: currentId,
                    content: 'accept',
                });
            }
            const p = new URLSearchParams();
            p.set("mode", "remote");
            inviteMode?.classList.add("hidden");
            setTimeout(() => {
            navigateTo("game", p);
            },500);
        });

        cBtn?.addEventListener("click", () => {
            inviteMode?.classList.add("hidden");
            sendMessage(friendId!, t('cht.inviteCancelled'));
            addMessageToChat('You', t('cht.inviteCancelled'), friendStatus);
            if (socket && socket.readyState === WebSocket.OPEN) {
                sendWS('invite_message', {
                    to: friendId,
                    from: currentId,
                    content: 'delete',
                });
            }
        });
    }
}

async function openProfile(userId: number): Promise<void> {
    const friend = friends.find(f => f.id === userId);

    const chat = document.getElementById("chatMessages") as HTMLElement;
	chat.innerHTML = "";

	const fakeBodyContainer = document.createElement("div");
	fakeBodyContainer.id = "bodyContainer";
	chat.appendChild(fakeBodyContainer);

    await renderProfile(friend as any, userId, chat);
}
