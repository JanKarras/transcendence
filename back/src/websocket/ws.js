const jwt = require('jsonwebtoken');
const db = require('../db');
const JWT_SECRET = process.env.JWT_SECRET;

const clients = new Map(); // userId -> ws
const activeDialog = new Map(); // userId -> friendId
const peerOpenMap = new Map(); // friendId -> boolean

module.exports = async function chatWebSocketRoute(fastify) {
  fastify.get('/chat', { websocket: true }, (ws, req) => {
    fastify.log.info('New WS connection request: ' + req.raw.url);

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
        `INSERT INTO user_status (user_id, status)
         VALUES (?, ?)
         ON CONFLICT(user_id) DO UPDATE SET status = excluded.status`
      ).run(senderId, 1);

      sendFriendStatus(senderId, 1);
    } catch (err) {
      fastify.log.error('❌ Token verification failed:', err.message);
      ws.close();
      return;
    }

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        // 👉 Dialog open/close
        if (data.type === 'dialog_open') {
          const { friendId, content } = data;
          activeDialog.set(senderId, friendId);

          if (content === '2') {
            // Dialog geschlossen
            const prevFriendId = activeDialog.get(senderId);
            const prevWs = clients.get(prevFriendId);
            if (prevWs && prevWs.readyState === ws.OPEN) {
              prevWs.send(JSON.stringify({ type: 'read_receipt', readerId: prevFriendId, content: '2' }));
            }
            return;
          }

          const isPeerOpenWithMe = activeDialog.get(friendId) === senderId;
          peerOpenMap.set(senderId, isPeerOpenWithMe);

          if (ws.readyState === ws.OPEN && content !== '2') {
            db.prepare(
              `UPDATE messages
               SET is_read = 0
               WHERE sender_id = ? AND receiver_id = ? AND is_read = 1`
            ).run(friendId, senderId);

            ws.send(JSON.stringify({
              type: 'read_receipt',
              readerId: friendId,
              content: isPeerOpenWithMe ? '1' : '0',
            }));
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
            notifyPeer(friendId, senderId, 'block');
          } else if (content === 'unblock') {
            db.prepare(`DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?`).run(senderId, friendId);
            notifyPeer(friendId, senderId, 'unblock');
          }
          return;
        }

        // 👉 Send message
        if (data.type === 'send_message') {
          const { friendId, content } = data;
          const info = db.prepare(
            `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`
          ).run(senderId, friendId, content);

          const messageId = info.lastInsertRowid;
          const receiverWs = clients.get(friendId);
          const isPeerOpenWithMe = activeDialog.get(friendId) === senderId;

          if (!receiverWs || !isPeerOpenWithMe) {
            db.prepare(`UPDATE messages SET is_read = 1 WHERE id = ?`).run(messageId);
            sendHasNewMessage(senderId, friendId, 1);
          }

          if (receiverWs && isPeerOpenWithMe) {
            receiverWs.send(JSON.stringify({
              type: 'chat',
              friendId,
              senderName: db.prepare('SELECT username FROM users WHERE id = ?').get(senderId).username,
              content,
            }));
          }
          return;
        }

        // 👉 Invite message (game)
        if (data.type === 'invite_message') {
          const { to: friendId, fromUsername: friendUserName, content } = data;
          const receiverWs = clients.get(friendId);

          if (content === 'sent') {
            db.prepare(
              `INSERT INTO requests (sender_id, receiver_id, type) VALUES (?, ?, ?)`
            ).run(senderId, friendId, 'game');
          } else if (content === 'delete') {
            db.prepare(
              `DELETE FROM requests WHERE sender_id = ? AND receiver_id = ?`
            ).run(senderId, friendId);
          }

          if (receiverWs) {
            receiverWs.send(JSON.stringify({
              type: 'invite_message',
              friendId,
              friendUserName,
              content,
            }));
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

      sendFriendStatus(senderId, 0);
      sendCloseStatus(senderId);

      activeDialog.delete(senderId);
      clients.delete(senderId);
      peerOpenMap.delete(senderId);
    });
  });

  function sendFriendStatus(userId, status) {
    const payload = JSON.stringify({ type: 'friend_status', userId, status });
    for (const [id, clientWs] of clients) {
      if (clientWs.readyState === clientWs.OPEN) {
        try { clientWs.send(payload); } catch (e) { fastify.log.error('WS send err:', e.message); }
      }
    }
  }

  function sendCloseStatus(userId) {
    const payload = JSON.stringify({ type: 'read_receipt', readerId: userId, content: '0' });
    for (const [id, clientWs] of clients) {
      if (clientWs.readyState === clientWs.OPEN) {
        try { clientWs.send(payload); } catch (e) { fastify.log.error('WS send err:', e.message); }
      }
    }
  }

  function sendHasNewMessage(userId, friendId, status) {
    const payload = JSON.stringify({ type: 'new_message', userId, friendId, status });
    for (const [id, clientWs] of clients) {
      if (clientWs.readyState === clientWs.OPEN) {
        try { clientWs.send(payload); } catch (e) { fastify.log.error('WS send err:', e.message); }
      }
    }
  }

  function notifyPeer(friendId, senderId, content) {
    const peerWs = clients.get(friendId);
    const isPeerOpenWithMe = activeDialog.get(friendId) === senderId;
    if (peerWs && isPeerOpenWithMe && peerWs.readyState === peerWs.OPEN) {
      peerWs.send(JSON.stringify({
        type: 'chat-block',
        friendId,
        senderName: db.prepare('SELECT username FROM users WHERE id = ?').get(senderId).username,
        content,
      }));
    }
  }
};
