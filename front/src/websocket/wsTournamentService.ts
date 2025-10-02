import { getFreshToken } from "../remote_storage/remote_storage.js";

let tournamentSocket: WebSocket | null = null;

export function getTournamentSocket(): WebSocket | null {
    return tournamentSocket;
}

export async function connectTournament(): Promise<WebSocket> {
    if (tournamentSocket && tournamentSocket.readyState === WebSocket.OPEN) {
        return tournamentSocket;
    }

    const token = await getFreshToken();
    if (!token) throw new Error("No auth token found");

    const wsUrl = `wss://${location.host}/ws/tournament?token=${token}`;
    tournamentSocket = new WebSocket(wsUrl);

    await new Promise<void>((resolve, reject) => {
        tournamentSocket!.onopen = () => {
            console.log(`✅ Tournament WebSocket connected to ${wsUrl}`);
            resolve();
        };
        tournamentSocket!.onerror = (err) => reject(err);
    });

    return tournamentSocket!;
}

export function closeTournamentSocket() {
    if (tournamentSocket) {
        tournamentSocket.close();
        tournamentSocket = null;
    }
}
