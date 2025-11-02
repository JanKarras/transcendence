const Fastify = require('fastify');
const websocket = require('@fastify/websocket');

const fastify = Fastify({ logger: true });

const start = async () => {
  await fastify.register(websocket);

  fastify.get('/echo', { websocket: true }, (ws, request) => {
  const remoteAddress = request.socket.remoteAddress;
  console.log('🟢 WS connected from', remoteAddress);

  ws.on('message', (msg) => {
    console.log('📩 Received from client:', msg.toString());
    ws.send(`Server echo: Hello client`);
  });

  ws.on('close', (code, reason) => {
    console.log('❌ WS disconnected, code:', code, 'reason:', reason?.toString());
  });

  ws.on('error', (err) => console.error('⚠️ WS error:', err.message));
});


  try {
    await fastify.listen({ port: 4002, host: '0.0.0.0' });
    console.log('🚀 Server running at http://0.0.0.0:4002');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
