const jwt = require('jsonwebtoken');
const db = require('../db');
const JWT_SECRET = process.env.JWT_SECRET;

const clients = new Map();
const activeDialog = new Map();

module.exports = async function chatWebSocketRoute(fastify) {
  fastify.get('/chat', { websocket: true }, (ws, req) => {
	console.log('New WS connection request: ' + req.raw.url);
    const parsedUrl = new URL(req.raw.url, `http://${req.headers.host}`);
    const token = parsedUrl.searchParams.get('token');

    if (!token) {
      fastify.log.warn('❌ No token found');
      ws.close();
      return;
    }

    let senderId = null;

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      senderId = payload.id;

      clients.set(senderId, ws);
      ws.send(JSON.stringify({ type: 'init', senderId }));
      fastify.log.info(`🟢 User ${senderId} connected`);

      db.prepare(
        `
          INSERT INTO user_status (user_id, status)
          VALUES (?, ?)
          ON CONFLICT(user_id) DO UPDATE SET status = excluded.status
        `
      ).run(senderId, 1);

      sendFriendStatus(senderId, 1, fastify);
    } catch (err) {
      fastify.log.error('❌ Token verification failed:', err.message);
      ws.close();
      return;
    }

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        // 👉 Dialog open
        if (data.type === 'dialog_open') {
          const { friendId, content } = data;
          activeDialog.set(senderId, friendId);

          let isPeerOpenWithMe = activeDialog.get(friendId) === senderId;

          if (ws.readyState === ws.OPEN && content !== '2') {
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
            if (peerWs && peerWs.readyState === ws.OPEN) {
              peerWs.send(JSON.stringify({ type: 'peer_dialog_open', peerId: senderId }));
              peerWs.send(JSON.stringify({ type: 'read_receipt', readerId: senderId, content: '1' }));
            }
          }
          return;
        }

        // 👉 Block/Unblock
        if (data.type === 'blocked') {
          const { blockedId: friendId, content } = data;

          if (content === 'block') {
            db.prepare(`INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)`).run(senderId, friendId);
            notifyPeer(friendId, senderId, 'заблокировал Вас ❌ ');
          } else if (content === 'unblock') {
            db.prepare(`DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?`).run(senderId, friendId);
            notifyPeer(friendId, senderId, 'разблокировал Вас ❌ ');
          }
          return;
        }

        // 👉 Send message
        if (data.type === 'send_message') {
          const { friendId, content } = data;
          db.prepare(
            `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`
          ).run(senderId, friendId, content);

          const receiverWs = clients.get(friendId);
          const isPeerOpenWithMe = activeDialog.get(friendId) === senderId;

          if (receiverWs && isPeerOpenWithMe) {
            receiverWs.send(
              JSON.stringify({
                type: 'chat',
                friendId,
                senderName: db.prepare('SELECT username FROM users WHERE id = ?').get(senderId).username,
                content,
              })
            );
          }
          return;
        }
      } catch (e) {
        fastify.log.error('❌ Invalid WS message', e.message);
      }
    });

    ws.on('close', () => {
      fastify.log.info(`🔴 User ${senderId} disconnected`);
      db.prepare(`UPDATE user_status SET status = 0 WHERE user_id = ?`).run(senderId);

      activeDialog.delete(senderId);
      clients.delete(senderId);
      sendFriendStatus(senderId, 0, fastify);
    });
  });

  function sendFriendStatus(userId, status, fastify) {
    const payload = JSON.stringify({ type: 'friend_status', userId, status });
    for (const [id, clientWs] of clients) {
      if (clientWs.readyState === clientWs.OPEN) {
        try {
          clientWs.send(payload);
        } catch (e) {
          fastify.log.error('WS send err:', e.message);
        }
      }
    }
  }

  function notifyPeer(friendId, senderId, content) {
    const peerWs = clients.get(friendId);
    const isPeerOpenWithMe = activeDialog.get(friendId) === senderId;
    if (peerWs && isPeerOpenWithMe && peerWs.readyState === peerWs.OPEN) {
      peerWs.send(
        JSON.stringify({
          type: 'chat-block',
          friendId,
          senderName: db.prepare('SELECT username FROM users WHERE id = ?').get(senderId).username,
          content,
        })
      );
    }
  }
};
