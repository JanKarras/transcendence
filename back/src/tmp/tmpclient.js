const WebSocket = require('ws');

const ws = new WebSocket('ws://127.0.0.1:4002/echo');

ws.on('open', () => {
  console.log('💬 Connected to server');
  ws.send('Hello server!');
});

ws.on('message', (msg) => {
  console.log('📩 Received from server:', msg.toString());
});

ws.on('close', () => {
  console.log('❌ Disconnected from server');
});

ws.on('error', (err) => {
  console.error('⚠️ Error:', err.message);
});
