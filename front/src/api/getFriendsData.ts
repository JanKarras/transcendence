import { Friend } from "../constants/structs";

export async function getFriendsData(friendId: number): Promise<Friend | null> {
	try {
		const response = await fetch(`/api/get/getFriendsData?friendId=${friendId}`, {
			credentials: "include",
		});

		if (!response.ok) {
			if (response.status === 404) {
				console.warn(`Friend with ID ${friendId} not found`);
				return null;
			}
			throw new Error(`HTTP error: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		console.error("Error fetching friend data:", error);
		return null;
	}
}
