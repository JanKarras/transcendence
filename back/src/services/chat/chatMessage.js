const { ping } = require("../friends/ping");
const { handleBlock } = require("./handler/handleBlock");
const { handleSendMessage } = require("./handler/handleSendMessage");
const { handleInviteMessage } = require("./handler/handleInviteMessage");
const { handleDialogOpen } = require("./handler/handleDialogOpen");

async function handleWsMessage(ws, userId, msg) {
	let data;
	try {
		data = JSON.parse(msg.toString());
	} catch {
		return ws.send(JSON.stringify({ type: "error", error: "Invalid JSON" }));
	}

	if (!userId) {
		return ws.send(JSON.stringify({ type: "error", error: "User not found" }));
	}

	console.log(`📩 Received message from user ${userId}:`, data);

	const handlers = {
		dialog_open: handleDialogOpen,
		blocked: handleBlock,
		send_message: handleSendMessage,
		invite_message: handleInviteMessage,
		ping,
	};

	const handler = handlers[data.type];
	if (handler) {
		await handler(userId, ws, data.data);
	} else {
		console.warn(`⚠️ Unknown message type: ${data.type}`);
	}
}

module.exports = {
	handleWsMessage,
};
