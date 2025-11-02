const { activeDashboardSockets } = require("../dashboard/dashboardStore");

function notifyDashboard(receiverId, type) {
    const ws = activeDashboardSockets.get(receiverId);

    if (ws && type === 1) {
        ws.send(JSON.stringify({ type: "newRequest" }));
    } else if (ws && type === 2) {
        ws.send(JSON.stringify({ type: "removedRequest" }));
    }

}

module.exports = {
    notifyDashboard
}