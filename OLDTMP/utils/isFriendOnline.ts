import { Friend } from "../constants/structs";


export function isFriendOnline(friend: Friend): boolean {
	const FIVE_MINUTES_MS = 5 * 60 * 1000;
	const now = Date.now();

	if (!friend.last_seen) return true;
	const lastSeenTime = new Date(friend.last_seen + " UTC").getTime();

	return now - lastSeenTime <= FIVE_MINUTES_MS;
}
