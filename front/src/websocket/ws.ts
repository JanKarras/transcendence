import {
    getMessages,
    getBlocked,
    getFriends,
    getStatus,
    getFreshToken,
} from '../remote_storage/remote_storage.js';

let socket: WebSocket | null = null;
let isConnecting = 0;
let friendStatus = -1;
let currentId: number | null = null;
let friendId: number | null = null;
let block: boolean = false;

let friends: Friend[] = [];

const friendElById = new Map<string, HTMLLIElement>();

interface Friend {
    id: number;
    username: string;
    online: boolean;
    blocked: boolean;
}

interface Message {
    from_username: string;
    content: string;
}

function getTokenFromLS(): string | null {
    return localStorage.getItem('auth_token');
}

async function ensureToken(): Promise<string | null> {
    let t = getTokenFromLS();
    if (t) return t;

    t = await getFreshToken();
    return t;
}

export async function connectWebSocket() {
    if (socket && socket.readyState === WebSocket.OPEN) return;
    if (isConnecting) return;
    console.log(localStorage.getItem('auth_token'));
    const token = await getFreshToken();
    if (token) {
        console.log('💬 Massage1:');
    } else {
        console.warn('WebSocket: No auth token found in cookies.');
    }

    const wsUrl = `wss://${location.host}/ws/chat?token=${token}`;

    // const token = await ensureToken();
    // if (!token) {
    //     console.warn('❌ Нет токена — WS не подключаюсь');
    //     return;
    // }
    // const wsUrl = `wss://${location.host}/ws/?token=${encodeURIComponent(
    //     token
    // )}`;
    // console.log('WS connect with token:', token.slice(0, 12) + '…');

    socket = new WebSocket(wsUrl);
	
    socket.onopen = () => {
        console.log('🔌 WebSocket connected', currentId);
        isConnecting = 1;
    };

    socket.onmessage = (event) => {
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
            if (userId === currentId) {
                console.warn(
                    '⚠️⚠️New massage currentPeerId=',
                    userId,
                    friendId
                );
                if (friendId && userId === currentId)
                    addMessageToChat(name, content, friendStatus);
            }
        }
        if (msg.type === 'chat-block') {
            const { friendId: userId, senderName: name, content } = msg;
            if (userId === currentId) {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    const chatHeader = document.getElementById(
                        'chatHeader'
                    ) as HTMLElement;
                    //chatHeader.textContent = `Выберите собеседника`;
                    friendId = 0;
                    const chat = document.getElementById(
                        'chatMessages'
                    ) as HTMLElement;
                    chat.innerHTML = '';
                    addMessageToChat(name, content, friendStatus);
                } else if (!socket || socket.readyState !== WebSocket.OPEN) {
                    console.warn(
                        '❌ WebSocket not connected, trying to reconnect...'
                    );
                    reconnectAndRetryMessage(friendId, content);
                }
            }
        }
        if (msg.type === 'read_receipt') {
            const { readerId: userId, content } = msg;
            if (userId === friendId) {
                content === '1' ? (friendStatus = 1) : (friendStatus = 0);
            }
            if (msg.content === '2') friendStatus = 0;
        }
        if (msg.type === 'peer_dialog_open') {
            if (msg.peerId === friendId) {
                if (socket && socket.readyState === WebSocket.OPEN) {
                    if (friendId) {
                        refreshDialog(friendId);
                    }
                }
            }
            return;
        }
        if (msg.type === 'friend_status') {
            const key = String(msg.userId);
            const li = friendElById.get(key);
            if (!li) {
                //console.debug('friend_status for unknown id', msg);
                return;
            }

            const nameSpan = li.querySelector<HTMLSpanElement>('.friend-name');
            if (!nameSpan) return;

            const username = li.dataset.name || '';
            const online = Number(msg.status);
            // let str = '';
            // if (online === 1) {
            //     str = '(онлайн)';
            //     friendStatus = 1;
            // } else {
            //     str = '(оффлайн)';
            //     friendStatus = 0;
            // }
            // nameSpan.textContent = `${username} ${str}`;
            nameSpan.textContent = `${username} ${
                online === 1 ? '(онлайн)' : '(оффлайн)'
            }`;
            return;
        }
    };

    socket.onclose = (ev) => {
        console.warn('🔌 WebSocket disconnected client');
        if (friendId) sendconnect(friendId, '0');
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
        const chatHeader = document.getElementById('chatHeader') as HTMLElement;
        chatHeader.textContent = `Чат с ${friendTemp.username}`;
        const history: Message[] = await getMessages(friendTemp.id);
		const chat = document.getElementById('chatMessages') as HTMLElement;
    chat.innerHTML = '';
        history.forEach((msg) => {
            const sender =
                msg.from_username === friendTemp.username
                    ? msg.from_username
                    : 'You';
            addMessageToChat(sender, msg.content, -1);
        });
    }
}

async function closeDialog() {
    friendId = 0;
    const chatHeader = document.getElementById('chatHeader') as HTMLElement;
    chatHeader.textContent = `Выберите собеседника`;
    const chat = document.getElementById('chatMessages') as HTMLElement;
    chat.innerHTML = 'Вы вышли из чата!';
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
        if (socket && socket.readyState === WebSocket.OPEN) {
            sendMessage(to, content);
        } else {
            alert('Сообщение не отправлено: WebSocket не подключен.');
        }
    }, 500);
}

export async function connectDialog(
    peerId: number,
    peerName: string,
    blocked: boolean
): Promise<void> {
    console.warn('oldfriend, newfriend', friendId, peerId);
    if (friendId && friendId !== peerId) {
        sendconnect(friendId, '2');
    }
    friendId = peerId;
    block = blocked;
    const chat = document.getElementById('chatMessages') as HTMLElement;
    chat.innerHTML = '';

    if (await blockedCheck(friendId)) {
        const chat = document.getElementById('chatMessages') as HTMLElement;
        chat.innerHTML = '❌ Пользователь Вас заблокировал!';
        friendId = null;
        return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
        const token = localStorage.getItem('auth_token');
        if (token) {
            connectWebSocket();
        } else
            console.warn(
                '❌❌❌ WebSocket not connected, trying to reconnect...',
                friendId
            );
    }
    console.warn('❌❌❌❌❌ token not finde', friendId);
    setTimeout(() => {
        if (friendId && socket && socket.readyState === WebSocket.OPEN) {
            sendconnect(friendId, '1');
            refreshFriendsList();
        } else {
            alert('Сообщение не отправлено: WebSocket не подключен.');
        }
    }, 500);

    const chatHeader = document.getElementById('chatHeader') as HTMLElement;
    chatHeader.textContent = `Чат с ${peerName}`;
    const history: Message[] = await getMessages(peerId);
    history.forEach((msg) => {
        const sender =
            msg.from_username === peerName ? msg.from_username : 'You';
        addMessageToChat(sender, msg.content, -1);
    });
}

async function sendconnect(friendId: number, content: string) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.warn('dialog send: ', content);
        socket.send(
            JSON.stringify({
                type: 'dialog_open',
                friendId,
                content,
            })
        );
    } else if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn('❌❌ WebSocket disconnected');
    }
}

export async function friendChat(content: string) {
    console.log('❌ User', friendId);
    if (friendId) {
        if (block) {
            addMessageToChat('', '❌ Пользователь заблокирован!', -1);
            return;
        }
        sendMessage(friendId, content);
        addMessageToChat('You', content, friendStatus);
    } else {
        const chat = document.getElementById('chatMessages') as HTMLElement;
        chat.innerHTML = '';
        addMessageToChat('', 'Выберите собеседника', -1);
    }
}

async function blockedCheck(friendId: number): Promise<boolean> {
    if (await getBlocked(friendId)) {
        addMessageToChat('', '❌ Пользователь Вас заблокировал!', -1);
        return true;
    }
    return false;
}

export async function blockUser(blockedId: number) {
    const content = 'block';
    addMessageToChat('', '❌ Пользователь заблокирован!', -1);
    if (socket && socket.readyState === WebSocket.OPEN) {
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
            chat.innerHTML = 'Повторное подключение...';
            addMessageToChat('', 'Повторите блокировку!', -1);
        }
        setTimeout(() => {}, 500);
    }
}

export async function unblockUser(blockedId: number) {
    const content = 'unblock';
    friendId = null;
    addMessageToChat('', 'Пользователь разблокирован!', -1);
    if (socket && socket.readyState === WebSocket.OPEN) {
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
            chat.innerHTML = 'Повторное подключение...';
            addMessageToChat('', 'Повторите разблокировку!', -1);
        }
        setTimeout(() => {}, 500);
    }
}

export async function renderFriendsList(friends: Friend[]): Promise<void> {
    const list = document.getElementById('friendsList') as HTMLUListElement;
    list.innerHTML = '';
    friendElById.clear();
    const statuses = await Promise.all(
        friends.map((f) => getStatus(f.id).catch(() => 0)) // 0 = оффлайн
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
            isOnline ? '(онлайн)' : '(оффлайн)'
        }`;
        nameSpan.style.cursor = 'pointer';
        nameSpan.onclick = () => {
            connectDialog(friend.id, friend.username, friend.blocked);
        };

        const blockBtn = document.createElement('button');
        if (friend.blocked) {
            blockBtn.textContent = '🔓';
            blockBtn.title = 'Разблокировать';
            blockBtn.onclick = async (e) => {
                await unblockUser(friend.id);
                refreshFriendsList();
            };
        } else {
            blockBtn.textContent = '🚫';
            blockBtn.title = 'Заблокировать';
            blockBtn.onclick = async (e) => {
                await blockUser(friend.id);
                refreshFriendsList();
            };
        }

        li.appendChild(nameSpan);
        li.appendChild(blockBtn);
        list.appendChild(li);
        friendElById.set(key, li);
    });
}

export async function refreshFriendsList(): Promise<void> {
    friends = await getFriends();
    renderFriendsList(friends);
}
