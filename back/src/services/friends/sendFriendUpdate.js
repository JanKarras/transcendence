const { collectFriendsData } = require("./collectFriendsData");

async function sendFriendsUpdate(userId, ws) {
  const data = await collectFriendsData(userId);
  if (data) {
    ws.send(JSON.stringify({ type: "friendsUpdate", data }));
  }
}

module.exports = {
	sendFriendsUpdate
}
