import { friendId, friendStatus, setFriendStatus } from "../chatSidebarTemplateStore.js";

export function handleReadReceipt(msg: any) {

    if (msg.readerId === friendId) {
        setFriendStatus(msg.content === '1' ? 1 : 0);
    }
    if (msg.content === '2') setFriendStatus(0);

}