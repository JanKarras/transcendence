import { getFreshToken } from "../api/getFreshToken.js";


let dashboardSocket: WebSocket | null = null;

export function getDashboardSocket(): WebSocket | null {
	return dashboardSocket;
}

export async function connectDashboard(): Promise<WebSocket> {
	if (dashboardSocket && dashboardSocket.readyState === WebSocket.OPEN) {
		return dashboardSocket;
	}

	const token = await getFreshToken();
	if (!token) throw new Error("No auth token found");

	const wsUrl = `wss://${location.host}/ws/dashboard?token=${token}`;
	dashboardSocket = new WebSocket(wsUrl);

	await new Promise<void>((resolve, reject) => {
		dashboardSocket!.onopen = () => {
			console.log(`✅ Dashboard WebSocket connected to ${wsUrl}`);
			resolve();
		};
		dashboardSocket!.onerror = (err) => reject(err);
	});

	return dashboardSocket!;
}

export function closeDashboardSocket() {
	if (dashboardSocket) {
		dashboardSocket.close();
		dashboardSocket = null;
	}
}
