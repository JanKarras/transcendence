const jwt = require('jsonwebtoken');
const db = require('../db');
const JWT_SECRET = process.env.JWT_SECRET;

const clients = new Map(); // userId -> ws
const activeDialog = new Map(); // userId -> friendId

module.exports = async function chatWebSocketRoute(fastify) {
  fastify.get('/chat', { websocket: true }, (ws, req) => {
    logEvent('info', null, 'New WS connection request', req.raw.url);

    const parsedUrl = new URL(req.raw.url, `http://${req.headers.host}`);
    const token = parsedUrl.searchParams.get('token');

    if (!token) {
      logEvent('warn', null, '❌ No token found');
      ws.close();
      return;
    }

    const senderId = handleConnect(ws, token);
    if (!senderId) return;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);

        switch (data.type) {
          case 'dialog_open':
            handleDialogOpen(senderId, data);
            break;

          case 'blocked':
            handleBlock(senderId, data);
            break;

          case 'send_message':
            handleSendMessage(senderId, data);
            break;

          case 'invite_message':
            handleInviteMessage(senderId, data);
            break;

          default:
            logEvent('warn', senderId, 'Unknown message type', data.type);
        }
      } catch (e) {
        logEvent('error', senderId, '❌ Invalid WS message', e.message);
      }
    });

    ws.on('close', () => handleDisconnect(senderId));
  });

  // ──────────────────────────────
  // HANDLERS
  // ──────────────────────────────

  function handleDialogOpen(senderId, { friendId, content }) {
    if (content === '2') {
      const prevFriendId = activeDialog.get(senderId);
      activeDialog.delete(senderId);

      if (prevFriendId) {
        sendToClient(prevFriendId, {
          type: 'read_receipt',
          readerId: senderId,
          content: '2',
        });
      }
      return;
    }

    activeDialog.set(senderId, friendId);
    const isPeerOpenWithMe = activeDialog.get(friendId) === senderId;

    markMessagesAsRead(friendId, senderId);

    sendToClient(senderId, {
      type: 'read_receipt',
      readerId: friendId,
      content: isPeerOpenWithMe ? '1' : '0',
    });

    if (isPeerOpenWithMe) {
      if (content === '4')
      {
        sendToClient(friendId, {
          type: 'peer_dialog_open',
          peerId: senderId,
        });
      }
      sendToClient(friendId, {
        type: 'read_receipt',
        readerId: senderId,
        content: '1',
      });
    }
  }

  function handleBlock(senderId, { blockedId: friendId, content }) {
    if (content === 'block') {
      db.prepare(`INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)`)
        .run(senderId, friendId);
      notifyPeer(friendId, senderId, 'block');
    } else if (content === 'unblock') {
      db.prepare(`DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?`)
        .run(senderId, friendId);
      notifyPeer(friendId, senderId, 'unblock');
    }
  }

  function handleSendMessage(senderId, { friendId, content }) {
    const info = db.prepare(
      `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`
    ).run(senderId, friendId, content);

    const messageId = info.lastInsertRowid;
    const hasSocket = clients.has(friendId);
    const isPeerOpenWithMe = activeDialog.get(friendId) === senderId;

    let delivered = false;
    if (hasSocket && isPeerOpenWithMe) {
      const senderName = db.prepare('SELECT username FROM users WHERE id = ?')
        .get(senderId).username;

      delivered = sendToClient(friendId, {
        type: 'chat',
        friendId,
        senderName,
        content,
      });
    }

    if (!delivered) {

      db.prepare(`UPDATE messages SET is_read = 1 WHERE id = ?`)
        .run(messageId);
      sendHasNewMessage(senderId, friendId, 1);
    }
  }

  function handleInviteMessage(senderId, { to: friendId, content }) {
    if (content === 'sent') {
      db.prepare(
        `INSERT INTO requests (sender_id, receiver_id, type) VALUES (?, ?, ?)`
      ).run(senderId, friendId, 'game');
    }
    else if (content === 'delete') {
      db.prepare(
        `DELETE FROM requests WHERE sender_id = ? AND receiver_id = ?`
      ).run(senderId, friendId);
    }
    else if (content === 'accept') {
      sendToClient(friendId, {
      type: 'invite_message',
      friendId,
      content,
      });
    }

    sendToClient(friendId, {
      type: 'invite_message',
      friendId,
      content,
    });

  }
  function handleConnect(ws, token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const userId = payload.id;

      clients.set(userId, ws);
      ws.send(JSON.stringify({ type: 'init', senderId: userId }));
      logEvent('info', userId, '🟢 connected');

      db.prepare(`
        INSERT INTO user_status (user_id, status)
        VALUES (?, ?)
        ON CONFLICT(user_id) DO UPDATE SET status = excluded.status
      `).run(userId, 1);

      sendFriendStatus(userId, 1);
      return userId;
    } catch (err) {
      logEvent('error', null, '❌ Token verification failed', err.message);
      ws.close();
      return null;
    }
  }

  function handleDisconnect(userId) {
    logEvent('info', userId, '🔴 disconnected');

    db.prepare(`UPDATE user_status SET status = 0 WHERE user_id = ?`)
      .run(userId);

    sendFriendStatus(userId, 0);
    sendCloseStatus(userId);

    activeDialog.delete(userId);
    clients.delete(userId);
  }

  // ──────────────────────────────
  // HELPERS
  // ──────────────────────────────

  function sendToClient(userId, payload) {
    const clientWs = clients.get(userId);

    if (clientWs && clientWs.readyState === clientWs.OPEN) {
      try {
        clientWs.send(JSON.stringify(payload));
        return true;
      } catch (e) {
        logEvent('error', userId, 'WS send err', e.message);
      }
    }
    return false;
  }

function broadcast(payload) {
    const message = JSON.stringify(payload);
    for (const [, clientWs] of clients) {
      if (clientWs.readyState === clientWs.OPEN) {
        try {
          clientWs.send(message);
        } catch (e) {
          logEvent('error', null, 'WS send err', e.message);
        }
      }
    }
  }

  function sendFriendStatus(userId, status) {
    broadcast({ type: 'friend_status', userId, status });
  }

  function sendCloseStatus(userId) {
    broadcast({ type: 'read_receipt', readerId: userId, content: '0' });
  }

  function sendHasNewMessage(userId, friendId, status) {
    sendToClient(friendId, { type: 'new_message', userId, friendId, status });
  }

  function markMessagesAsRead(friendId, userId) {
    db.prepare(`
      UPDATE messages
      SET is_read = 0
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 1
    `).run(friendId, userId);
  }

  function notifyPeer(friendId, senderId, content) {
    const isPeerOpenWithMe = activeDialog.get(friendId) === senderId;
    if (!isPeerOpenWithMe) return;

    const senderName = db.prepare(
      'SELECT username FROM users WHERE id = ?'
    ).get(senderId).username;

    sendToClient(friendId, {
      type: 'chat-block',
      friendId,
      senderName,
      content,
    });
  }

  function logEvent(level, userId, event, details = '') {
    const prefix = userId ? `[User ${userId}]` : '';
    const message = `${event} ${details}`.trim();

    if (level === 'info') {
      fastify.log.info(`${prefix} ${message}`);
    } else if (level === 'warn') {
      fastify.log.warn(`${prefix} ${message}`);
    } else {
      fastify.log.error(`${prefix} ${message}`);
    }
  }
};
