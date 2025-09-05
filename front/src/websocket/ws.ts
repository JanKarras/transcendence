import {
    getMessages,
    getBlocked,
    getFriends,
    getStatus,
} from '../remote_storage/remote_storage.js';

let socket: WebSocket | null = null;
let isConnecting = 0;
let friendStatus = -1;
let currentId: number | null = null;
let friendId: number | null = null;
let inviteStatus: number = 0;

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
}

interface Message {
    from_username: string;
    content: string;
    is_read: number;
    is_invite: number;
}

export async function connectWebSocket() {
    if (socket && socket.readyState === WebSocket.OPEN) return;
    if (isConnecting) return;
    const token = await getFreshToken();
    if (token) {
        console.log('💬 Massage2:');
    } else {
        console.warn('WebSocket: No auth token found in cookies.');
    }

    const wsUrl = `wss://${location.host}/ws/chat?token=${token}`;

    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        isConnecting = 1;
    };

    socket.onmessage = (event) => {
        // let msg: any;
        // try {
        //     msg = JSON.parse(event.data);
        // } catch {
        //     return;
        // }

        // switch (msg.type) {
        //     case 'init': {
        //         const { senderId: Id } = msg;
        //         currentId = Id;
        //         console.log('🔌 WebSocket connected', currentId);
        //         break;
        //     }

        //     case 'chat': {
        //         const { friendId: userId, senderName: name, content } = msg;
        //         if (userId === friendId)
        //             addMessageToChat(name, content, friendStatus);
        //         break;
        //     }

        //     case 'chat-block': {
        //         const { friendId: userId, senderName: name, content } = msg;
        //         if (userId === currentId) {
        //             if (socket && socket.readyState === WebSocket.OPEN) {
        //                 friendId = 0;
        //                 const chat = document.getElementById(
        //                     'chatMessages'
        //                 ) as HTMLElement;
        //                 chat.innerHTML = '';
        //                 addMessageToChat(name, content, friendStatus);
        //             } else {
        //                 console.warn(
        //                     '❌ WebSocket not connected, trying to reconnect...'
        //                 );
        //                 reconnectAndRetryMessage(friendId, content);
        //             }
        //         }
        //         break;
        //     }

        //     case 'read_receipt': {
        //         const { readerId: userId, content } = msg;
        //         if (userId === friendId) {
        //             friendStatus = content === '1' ? 1 : 0;
        //         }
        //         if (content === '2') friendStatus = 0;
        //         break;
        //     }

        //     case 'peer_dialog_open': {
        //         if (msg.peerId === friendId) {
        //             if (socket?.readyState === WebSocket.OPEN && friendId) {
        //                 refreshDialog(friendId);
        //             }
        //         }
        //         break;
        //     }

        //     case 'friend_status': {
        //         const key = String(msg.userId);
        //         const li = friendElById.get(key);
        //         if (!li) return;
        //         const nameSpan =
        //             li.querySelector<HTMLSpanElement>('.friend-name');
        //         if (!nameSpan) return;
        //         const username = li.dataset.name || '';
        //         const online = Number(msg.status);
        //         nameSpan.textContent = `${username} ${
        //             online === 1 ? '(online)' : '(offline)'
        //         }`;
        //         break;
        //     }

        //     case 'new_massage':
        //         {
        //             const key = String(msg.userId);
        //             const badge = friendBadgeById.get(key);
        //             if (!badge || msg.friendId !== currentId) return;
        //             const has_unread = Number(msg.status);
        //             badge.textContent = has_unread ? ' 📩' : '';
        //             break;
        //         }

        //         //default:

        //         break;
        // }
        let msg: any;
        try {
            msg = JSON.parse(event.data);
        } catch {
            return;
        }
        if (msg.type === 'init') {
            const { senderId: Id } = msg;
            currentId = Id;
            console.log('🔌 WebSocket connected', currentId);
        }
        if (msg.type === 'chat') {
            const { friendId: userId, senderName: name, content } = msg;
            if (userId === currentId && friendId)
                addMessageToChat(name, content, friendStatus);
        }
        if (msg.type === 'chat-block') {
            const { friendId: userId, senderName: name, content } = msg;

            if (content === 'unblock' && friendId) {
                refreshDialog(friendId);
                return;
            }

            if (content === 'block' && userId === currentId) {
                const newContent = ' has blocked you ❌ ';

                if (socket && socket.readyState === WebSocket.OPEN) {
                    const chat = document.getElementById('chatMessages') as HTMLElement;
                    chat.innerHTML = '';
                    addMessageToChat(name, newContent, friendStatus);
                } else {
                    console.warn('❌ WebSocket not connected, trying to reconnect...');
                    reconnectAndRetryMessage(friendId, newContent);
                }
            }
        }
        if (msg.type === 'read_receipt') {
            const { readerId: userId, content } = msg;
            if (userId === friendId) {
                content === '1' ? (friendStatus = 1) : (friendStatus = 0);
            }
            if (msg.content === '2') friendStatus = 0;
            return;
        }
        if (msg.type === 'peer_dialog_open') {
            if (friendId && msg.peerId === friendId) {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    console.log('peer_dialog_open');
                        refreshDialog(friendId);
                }
            }
            return;
        }
        if (msg.type === 'friend_status') {
            const key = String(msg.userId);
            const li = friendElById.get(key);
            if (!li) return;
            const nameSpan = li.querySelector<HTMLSpanElement>('.friend-name');
            if (!nameSpan) return;
            const username = li.dataset.name || '';
            const online = Number(msg.status);
            nameSpan.textContent = `${username} ${
                online === 1 ? '(online)' : '(offline)'
            }`;
            return;
        }
        if (msg.type === 'new_massage') {
            const key = String(msg.userId);
            const badge = friendBadgeById.get(key);
            if (!badge || msg.friendId !== currentId) return;
            const has_unread = Number(msg.status);
            badge.textContent = has_unread ? ' 📩' : '';
            return;
        }
        if (msg.type === 'invite_message') {

            const { friendId: userId, friendUserName: name, content} = msg;
            if (content === 'delete' && friendId)
                {
                    inviteStatus = 0;
                    refreshDialog(friendId);
                    return;
                }
            if (userId === currentId && content === 'sent'){
                inviteStatus = 2;
                //makeButton(name, 'Invite is decline',2);
                //console.log('inviteStatus', inviteStatus)
            }
        }
    };

    socket.onclose = (ev) => {
        console.warn('🔌 WebSocket disconnected client');
        friendId = 0;
        friendStatus = 0;
        isConnecting = 0;
        socket = null;
        closeDialog();
    };

    socket.onerror = (err) => {
        console.error('⚠️ WebSocket error:', err);
        isConnecting = 0;
    };
}

async function refreshDialog(friendId: number) {
    const friendTemp = friends.find((f) => f.id === friendId);
    if (friendTemp) {
        if (await getBlocked(friendId) === 2) return;
        const chatHeader = document.getElementById('chatHeader') as HTMLElement;
        chatHeader.textContent = `Chat with ${friendTemp.username}`;
        messages = await getMessages(friendTemp.id);
        const chat = document.getElementById('chatMessages') as HTMLElement;
        chat.innerHTML = '';
        messages.forEach((msg, index) => {
            const isLast = index === messages.length - 1;
            const sender =
                msg.from_username === friendTemp.username
                    ? msg.from_username
                    : 'You';
            if (msg.is_read && msg.from_username !== friendTemp.username)
                addMessageToChat(sender, msg.content, 0);
            else addMessageToChat(sender, msg.content, -1);
            if(isLast && msg.content === 'An invitation to the game has been sent' && msg.is_invite === 1)
            {
                if(msg.from_username !== friendTemp.username && friendId)
                    makeButton(sender, 'Invite is cancel', 1);
                else if(msg.from_username === friendTemp.username && friendId)
                    makeButton(sender, 'Invite is decline', 2);
            }
        });
    }
}

async function closeDialog() {
    friendId = 0;
    const chatHeader = document.getElementById('chatHeader') as HTMLElement;
    chatHeader.textContent = `Select a chat partner`;
    const chat = document.getElementById('chatMessages') as HTMLElement;
    chat.innerHTML = 'You left the chat!';
}

async function getFreshToken(): Promise<string | null> {
    try {
        const res = await fetch('/api/get/token', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to get token');
        const data = await res.json();
        if (data?.token) {
            localStorage.setItem('auth_token', data.token); // ← сохраняем!
            return data.token;
        }
        return null;
    } catch (err) {
        console.error('Token refresh error:', err);
        return null;
    }
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
    div.textContent = `${content}`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    setTimeout(() => {
        div.remove();
    }, 2000);
}

export async function sendMessage(friendId: number, content: string) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
            JSON.stringify({
                type: 'send_message',
                friendId,
                content,
            })
        );
    } else if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn('❌ WebSocket not connected, trying to reconnect...');
        reconnectAndRetryMessage(friendId, content);
    }
}
export function reconnectAndRetryMessage(to: any, content: string) {
    const token = localStorage.getItem('auth_token');
    if (token) {
        connectWebSocket();
    }
    setTimeout(() => {
        if (content && socket && socket.readyState === WebSocket.OPEN) {
            sendMessage(to, content);
        }
    }, 500);
}

function waitForSocketOpen(socket: WebSocket, timeout = 3000): Promise<void> {
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

export async function connectDialog(
    peerId: number,
    peerName: string
): Promise<void> {
    inviteStatus = 0;
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

        if (friendId) {
            sendconnect(friendId, '1');
            refreshFriendsList();
        }
    } catch (err) {
        alert('❌ Message not sent: WebSocket not connected.');
    }

    if (await blockedCheck(friendId) === 2) {
        console.log('blockedCheck(friendId) === 2');
        const chatHeader = document.getElementById('chatHeader') as HTMLElement;
        chatHeader.textContent = `Chat with ${peerName}`;
        const chat = document.getElementById('chatMessages') as HTMLElement;
        return;
    }

    const chatHeader = document.getElementById('chatHeader') as HTMLElement;
    chatHeader.textContent = `Chat with ${peerName}`;
    messages = await getMessages(peerId);
    messages.forEach((msg, index) => {
        const isLast = index === messages.length-1;
        const sender =
            msg.from_username === peerName ? msg.from_username : 'You';
        if (msg.is_read && msg.from_username !== peerName)
            addMessageToChat(sender, msg.content, 0);
        else addMessageToChat(sender, msg.content, -1);
        if(isLast && msg.content === 'An invitation to the game has been sent' && msg.is_invite === 1)
        {
            if(msg.from_username !== peerName && friendId)
            {
                makeButton(sender, 'Invite is cancel', 1);
                inviteStatus = 1;
            }
            else if(msg.from_username === peerName && friendId)
            {
                makeButton(sender, 'Invite is decline', 2);
                inviteStatus = 1;
            }
        }
    });

}

async function sendconnect(friendId: number, content: string) {
    console.log('second connect', friendId, content);
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
            JSON.stringify({
                type: 'dialog_open',
                friendId,
                content,
            })
        );
    } else if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn('❌ WebSocket disconnected');
    }
}

export async function friendChat(content: string) {
    if (friendId) {
        if (
            await blockedCheck(friendId)) {
            return;
        }
        if (await inviteCheckStatus(friendId)) return;
        sendMessage(friendId, content);
        addMessageToChat('You', content, friendStatus);
    } else {
        const chat = document.getElementById('chatMessages') as HTMLElement;
        chat.innerHTML = '';
        //addMessageToChat('', 'Select a chat partner', -1);
        addDisappearMessage('Select a chat partner');
    }
}

async function blockedCheck(friendId: number): Promise<number> {
    const temp = await getBlocked(friendId);
    if (temp === 2) {
        //console.log('blockedCheck  2')
        //addMessageToChat('', '❌ You have been blocked!', -1);
        addDisappearMessage('❌ You have been blocked!');
        return 2;
    }
    else if (temp === 1){
        //console.log('blocked  Check  1')
        //addMessageToChat('', '❌ User is blocked!', -1);
        addDisappearMessage('❌ User is blocked!');
        return 1;
    }
    return 0;
}

export async function blockUser(blockedId: number) {
    const content = 'block';
    //console.log('inviteStatus = ', inviteStatus);
    if (socket && socket.readyState === WebSocket.OPEN) {
        if (await inviteCheckStatus(blockedId)) return;
        if (!friendId || friendId !== blockedId)
        {
            const chat = document.getElementById('chatMessages') as HTMLElement;
            chat.innerHTML = 'You have switched or not selected a user';
            addMessageToChat('', 'Retry blocking!', -1);
            setTimeout(() => {
                connectDialog(blockedId, '');
            }, 2500);
            return;
        }
        sendMessage(blockedId, '🚫Blocked');
        if (await getBlocked(friendId) === 2) {
            //addMessageToChat('You', '🚫Blocked', friendStatus);
            addDisappearMessage('🚫Blocked');
        }
        else{
            addMessageToChat('You', '🚫Blocked', friendStatus);
        }
        socket.send(
            JSON.stringify({
                type: 'blocked',
                blockedId,
                content,
            })
        );
    } else if (!socket || socket.readyState !== WebSocket.OPEN) {
        const token = localStorage.getItem('auth_token');
        if (token) {
            connectWebSocket();
            const chat = document.getElementById('chatMessages') as HTMLElement;
            chat.innerHTML = 'Reconnecting...';
            addMessageToChat('', 'Retry blocking!', -1);
        }
    }
}

export async function unblockUser(blockedId: number) {
    const content = 'unblock';
    console.log('blockedId = ', blockedId);
    if (socket && socket.readyState === WebSocket.OPEN ) {
        if (friendId !== blockedId)
        {
            const chat = document.getElementById('chatMessages') as HTMLElement;
            chat.innerHTML = 'You have switched or not selected a user';
            addMessageToChat('', 'Retry unblocking!', -1);
            setTimeout(() => {
                connectDialog(blockedId, '');
            }, 2500);
            return;
        }
        sendMessage(blockedId, '🔓Unblocked');
        //if (await getBlocked(blockedId) !== 2)
        if (await getBlocked(friendId) === 2) {
            //addMessageToChat('You', '🔓Unblocked', friendStatus);
            addDisappearMessage('🔓Unblocked');
        }
        else{
            addMessageToChat('You', '🔓Unblocked', friendStatus);
        }
        //addMessageToChat('You', '🔓Unblocked', friendStatus);
        socket.send(
            JSON.stringify({
                type: 'blocked',
                blockedId,
                content,
            })
        );
    } else if (!socket || socket.readyState !== WebSocket.OPEN) {
        const token = localStorage.getItem('auth_token');
        if (token) {
            connectWebSocket();
            const chat = document.getElementById('chatMessages') as HTMLElement;
            chat.innerHTML = 'Reconnecting...';
            addMessageToChat('', 'Retry unblocking!', -1);
        }
    }
}

export async function renderFriendsList(friends: Friend[]): Promise<void> {
    const list = document.getElementById('friendsList') as HTMLUListElement;
    list.innerHTML = '';
    friendElById.clear();
    const statuses = await Promise.all(
        friends.map((f) => getStatus(f.id).catch(() => 0)) // 0 = offline
    );
    friends.forEach((friend, i) => {
        const li = document.createElement('li');
        const key = String(friend.id);
        li.dataset.id = key;
        li.dataset.name = friend.username;
        const isOnline = statuses[i] === 1;
        const nameSpan = document.createElement('span');
        nameSpan.className = 'friend-name';
        nameSpan.textContent = `${friend.username} ${
            isOnline ? '(online)' : '(offline)'
        }`;
        const badge = document.createElement('span');
        badge.dataset.id = key;
        badge.className = 'unread-badge';
        badge.textContent = friend.has_unread ? ' 📩' : '';
        friendBadgeById.set(key, badge);

        nameSpan.style.cursor = 'pointer';
        nameSpan.onclick = () => {
            connectDialog(friend.id, friend.username);
        };

        const blockBtn = document.createElement('button');
        if (friend.blocked) {
            blockBtn.textContent = '🔓';
            blockBtn.title = 'Unblock';
            blockBtn.onclick = async (e) => {
                await unblockUser(friend.id);
                refreshFriendsList();
            };
        } else {
            blockBtn.textContent = '🚫';
            blockBtn.title = 'Block';
            blockBtn.onclick = async (e) => {
                await blockUser(friend.id);
                refreshFriendsList();
            };
        }
        const InviteBtn = document.createElement('button');
        InviteBtn.textContent = '🎮';
            InviteBtn.title = 'Invite';
            InviteBtn.onclick = async (e) => {

                    await inviteFriend(friend.id, friend.username);

            };
        const ProfileBtn = document.createElement('button');
        ProfileBtn.textContent = '...';
            ProfileBtn.title = 'Profile';
            ProfileBtn.onclick = async (e) => {

            };

        li.appendChild(nameSpan);
        li.appendChild(blockBtn);
        li.appendChild(InviteBtn);
        li.appendChild(ProfileBtn);
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
    if (friendId !== inviterId)
        {
            const chat = document.getElementById('chatMessages') as HTMLElement;
            chat.innerHTML = 'You have switched or not selected a user';
            addMessageToChat('', 'Retry sending invite', -1);
            setTimeout(() => {
                connectDialog(inviterId, '');
            }, 2500);
            return;
        }
    if (await blockedCheck(inviterId)) return;
    console.log(' inviteStatus',  inviteStatus);
    if (socket && socket.readyState === WebSocket.OPEN) {
        if (await inviteCheckStatus(inviterId)) return;
        inviteStatus = 1;
        connectDialog(inviterId, username);
        sendMessage(inviterId, 'An invitation to the game has been sent');
        socket.send(
            JSON.stringify({
                type: "invite_message",
                to: inviterId,
                from: currentId,
                fromUsername: username,
                content: 'sent',
            })
        );
    } else if (!socket || socket.readyState !== WebSocket.OPEN) {
        const token = localStorage.getItem('auth_token');
        if (token) {
            connectWebSocket();
            const chat = document.getElementById('chatMessages') as HTMLElement;
            chat.innerHTML = 'Reconnecting...';
            addMessageToChat('', 'Retry sending invite!', -1);
        }
    }
}

async function inviteCheckStatus(inviterId: number): Promise<number>
{
    if (inviteStatus === 1 && inviterId === friendId){
        //addMessageToChat('', 'Wait for a response or cancel the invite!', -1);
        addDisappearMessage('Wait for a response or cancel the invite!');
        return 1;
    }
    else if (inviteStatus === 2 && inviterId === friendId){
        //addMessageToChat('', 'Accept or cancel the invite!', -1);
        addDisappearMessage('Accept or cancel the invite!');
        return 1;
    }
    return 0;
}

async function makeButton(username: string, content: string, statusInv: number): Promise<void>
{
    const chat = document.getElementById('chatMessages') as HTMLElement;
    const container = document.createElement('div');
    const declineBtn = document.createElement('button');
    const acceptBtn = document.createElement('button');
    if (statusInv === 1){
    declineBtn.textContent = "[Cancel]";
    declineBtn.classList.add('cancel');}
    else if (statusInv === 2){
        acceptBtn.textContent = "[Accept]";
        acceptBtn.classList.add('accept');
        acceptBtn.onclick = () => {
            //window.location.href = `/pong?friendId=${data.from}`;
            };
        declineBtn.textContent = "[Cancel]";
                declineBtn.classList.add('decline');
    }
    declineBtn.onclick = () => {
        console.log('onclick friend = ', friendId)
        if (friendId)
        {
            sendMessage(friendId, content);

            refreshDialog(friendId);
        }
        addMessageToChat('You', content, -1);
        inviteStatus = 0;
        if (socket && socket.readyState === WebSocket.OPEN)
        {
            socket.send(
                JSON.stringify({
                    type: "invite_message",
                    to: friendId,
                    from: currentId,
                    fromUsername: username,
                    content: 'delete',
                })
            );
        }
        container.remove();
    };
    if (statusInv === 2)
    {
        container.appendChild(acceptBtn);
    }
    container.appendChild(declineBtn);
    chat.appendChild(container);
    chat.scrollTop = chat.scrollHeight;
}
