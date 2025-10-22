const userUtilsRepo = require('../../repositories/userUtilsRepository');
const userRepo = require('../../repositories/userRepository');
const reqRepo = require('../../repositories/requestRepository');

async function collectFriendsData(userId) {
	const userData = await userUtilsRepo.getUserById(userId);
	const allUsers = await userRepo.getAllUsers();
	if (!userData || !allUsers) return null;

	const allFriends = await userRepo.getFriends(userId);
	const recvRequests = await reqRepo.getReceivedRequestsByUserId(userId);
	const sentRequests = await reqRepo.getSentRequestsByUserId(userId);

	const FIVE_MINUTES_MS = 5 * 60 * 1000;
	const now = Date.now();

	const onlineFriends = allFriends.filter(friend => {
		if (!friend.last_seen) return true;
		const lastSeenTime = new Date(friend.last_seen + " UTC").getTime();
		return now - lastSeenTime <= FIVE_MINUTES_MS;
	});

	const offlineFriends = allFriends.filter(friend => {
		if (!friend.last_seen) return false;
		const lastSeenTime = new Date(friend.last_seen + " UTC").getTime();
		return now - lastSeenTime > FIVE_MINUTES_MS;
	});

	const sortedFriends = [...allFriends].sort((a, b) => {
		const aOnline = onlineFriends.some(f => f.username === a.username);
		const bOnline = onlineFriends.some(f => f.username === b.username);
		if (aOnline && !bOnline) return -1;
		if (!aOnline && bOnline) return 1;
		return a.username.localeCompare(b.username);
	});

	const usersWithoutMe = allUsers.filter(u => u.id !== userId);

	const friendIds = new Set(allFriends.map(f => f.id));
	const notFriends = usersWithoutMe.filter(u => !friendIds.has(u.id));

	return {
		allUsers: usersWithoutMe,
		allFriends: sortedFriends,
		onlineFriends,
		offlineFriends,
		notFriends,
		recvRequest: recvRequests,
		sendRequest: sentRequests
	};
}

module.exports = {
	collectFriendsData
};
