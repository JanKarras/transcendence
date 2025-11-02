import { getFriendsData } from "../../api/getFriendsData.js";
import { Friend, UserInfo } from "../../constants/structs.js";
import { showFriendProfileModal } from "../../logic/templates/friendProfileModal.js";

export async function renderProfile(user: UserInfo, id: number, container: HTMLElement | null) {
    const friend : Friend | null = await getFriendsData(id);
    
    if (friend) {
        showFriendProfileModal(friend);
    }
}
