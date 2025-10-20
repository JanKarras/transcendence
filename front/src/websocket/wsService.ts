import { getFreshToken } from "../remote_storage/remote_storage.js";

let socket: WebSocket | null = null;

export function getSocket(): WebSocket | null {
    return socket;
}

export async function connect() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        return socket;
    }

    const token = await getFreshToken();
    console.log(token);
    if (!token) {
        throw new Error("No auth token found");
    }

    const wsUrl = `wss://${location.host}/ws/game?token=${token}`;
    socket = new WebSocket(wsUrl);

    await new Promise<void>((resolve, reject) => {
        socket!.onopen = () => {
            console.log(`✅ WebSocket connected to ${wsUrl}`);
            resolve();
        };
        socket!.onerror = (err) => {
            reject(err);
        };
    });

    return socket!;
}

export async function connectWithHandler(
  onMessage: (event: MessageEvent) => void
): Promise<WebSocket> {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.onmessage = onMessage;
    return socket;
  }

  const token = await getFreshToken();
  if (!token) {
    throw new Error("No auth token found");
  }

  const wsUrl = `wss://${location.host}/ws/game?token=${token}`;
  socket = new WebSocket(wsUrl);

  await new Promise<void>((resolve, reject) => {
    socket!.onopen = () => {
      console.log(`✅ WebSocket connected to ${wsUrl}`);
      resolve();
    };
    socket!.onerror = (err) => {
      console.error("❌ WebSocket error", err);
      reject(err);
    };
  });

  socket.onmessage = onMessage;

  return socket!;
}
