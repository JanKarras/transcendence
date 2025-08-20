const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const db = require('../db');
const JWT_SECRET = process.env.JWT_SECRET;

const clients = new Map(); // userId -> ws
const activeDialog = new Map();
let isPeerOpenWithMe = false;
// function getUsernameById(id) {
//     const row = db.prepare(`SELECT username FROM users WHERE id = ?`).get(id);
//     return row ? row.username : `User${id}`;
// }

function startWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });
    console.log('Message 1');
    wss.on('connection', (ws, req) => {
        // Авторизация через Cookie или Query
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        const token = parsedUrl.searchParams.get('token');
        if (!token) {
            console.log('❌ No token found');
            ws.close(); // <-- здесь отваливается соединение
            return;
        }
        let senderId = null;

        try {
            const payload = jwt.verify(token, JWT_SECRET);
            senderId = payload.id;
            clients.set(senderId, ws);
            ws.send(JSON.stringify({ type: 'init', senderId }));
            console.log(`🟢 User ${senderId} connected`);
            db.prepare(
                `
                            INSERT INTO user_status (user_id, status)
                            VALUES (?, ?)
                            ON CONFLICT(user_id) DO UPDATE SET status = excluded.status
                        `
            ).run(senderId, 1);
            sendFriendStatus(senderId, 1);
        } catch (err) {
            console.log('❌ Token verification failed:', err.message);
            ws.close();
            return;
        }

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'dialog_open') {
                    const { friendId: friendId, content } = data;
                    activeDialog.set(senderId, friendId);
                    if (content === '2') {
                        const prevFriendId = activeDialog.get(senderId);

                        const prevWs = clients.get(prevFriendId);
                        if (prevWs && prevWs.readyState === WebSocket.OPEN) {
                            prevWs.send(
                                JSON.stringify({
                                    type: 'read_receipt',
                                    readerId: prevFriendId,
                                    content: '2',
                                })
                            );
                        }
                        return;
                    }
                    isPeerOpenWithMe = activeDialog.get(friendId) === senderId;
                    if (ws.readyState === WebSocket.OPEN && content !== '2') {
                        ws.send(
                            JSON.stringify({
                                type: 'read_receipt',
                                readerId: friendId,
                                content: isPeerOpenWithMe ? '1' : '0',
                            })
                        );
                    }
                    if (isPeerOpenWithMe) {
                        const peerWs = clients.get(friendId);
                        if (peerWs && peerWs.readyState === WebSocket.OPEN) {
                            peerWs.send(
                                JSON.stringify({
                                    type: 'peer_dialog_open',
                                    peerId: senderId,
                                })
                            );
                            peerWs.send(
                                JSON.stringify({
                                    type: 'read_receipt',
                                    readerId: senderId,
                                    content: '1',
                                })
                            );
                        }
                    }
                    return;
                }
                if (data.type === 'blocked') {
                    const { blockedId: friendId, content } = data;
                    if (content === 'block') {
                        db.prepare(
                            `
                            INSERT INTO blocks (blocker_id, blocked_id)
                            VALUES (?, ?)
                        `
                        ).run(senderId, friendId);
                        const receiverWs = clients.get(friendId);
                        if (receiverWs && isPeerOpenWithMe) {
                            receiverWs.send(
                                JSON.stringify({
                                    type: 'chat-block',
                                    friendId,
                                    senderName: db
                                        .prepare(
                                            'SELECT username FROM users WHERE id = ?'
                                        )
                                        .get(senderId).username,
                                    content: 'заблокировал Вас ❌ ',
                                })
                            );
                        }
                    } else if (content === 'unblock') {
                        db.prepare(
                            `
                            DELETE FROM blocks
                            WHERE blocker_id = ? AND blocked_id = ?
                        `
                        ).run(senderId, friendId);
                        const receiverWs = clients.get(friendId);
                        if (receiverWs && isPeerOpenWithMe) {
                            receiverWs.send(
                                JSON.stringify({
                                    type: 'chat-block',
                                    friendId,
                                    senderName: db
                                        .prepare(
                                            'SELECT username FROM users WHERE id = ?'
                                        )
                                        .get(senderId).username,
                                    content: 'разблокировал Вас ❌ ',
                                })
                            );
                        }
                    }
                }
                if (data.type === 'send_message') {
                    console.log(`❌❌❌ User текущий ${senderId} connected`);
                    const { friendId: friendId, content } = data;
                    db.prepare(
                        `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`
                    ).run(senderId, friendId, content);
                    const receiverWs = clients.get(friendId);
                    if (receiverWs && isPeerOpenWithMe) {
                        receiverWs.send(
                            JSON.stringify({
                                type: 'chat',
                                friendId,
                                senderName: db
                                    .prepare(
                                        'SELECT username FROM users WHERE id = ?'
                                    )
                                    .get(senderId).username,
                                content,
                            })
                        );
                    }
                }
            } catch (e) {
                console.error('❌ Invalid WS message', e.message);
            }
        });

        ws.on('close', () => {
            console.log(`🔴 User ${senderId} disconnected`);
            db.prepare(
                `
                UPDATE user_status SET status = 0 WHERE user_id = ?
                `
            ).run(senderId);
            activeDialog.delete(senderId);
            sendFriendStatus(senderId, 0);
            clients.delete(senderId);
        });
    });

    function sendFriendStatus(userId, status) {
        const payload = JSON.stringify({
            type: 'friend_status',
            userId,
            status,
        });
        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(payload);
                } catch (e) {
                    console.error('WS send err:', e.message);
                }
            }
        }
    }
}

module.exports = { startWebSocketServer };
