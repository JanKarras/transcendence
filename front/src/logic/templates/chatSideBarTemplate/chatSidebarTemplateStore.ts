export let friendStatus = -1;
export let currentId: number | null = null;
export let friendId: number | null = null;

export let friends: Friend[] = [];
export let messages: Message[] = [];

export const friendElById = new Map<string, HTMLLIElement>();
export const friendBadgeById = new Map<string, HTMLSpanElement>();

export interface Friend {
	id: number;
	username: string;
	online: boolean;
	blocked: boolean;
	has_unread: number;
	path: string;
}

export interface Message {
	from_username: string;
	content: string;
	is_read: number;
	is_invite: number;
}

export function setCurrentId(id: number) {
	currentId = id;
}

export function setMessages(msgs: Message[]) {
	messages = msgs;
}

export function setFriendStatus(status: number) {
	friendStatus = status;
}

export function setFriends(frnds: Friend[]) {
	friends = frnds;
}

export function setFriendId(id: number | null) {
	friendId = id;
}