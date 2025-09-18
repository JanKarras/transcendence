import {
    friendsBtn,
    friendsNumber,
    headernavs,
    MENU_CONTAINER_ID,
    profile,
    profileContainer,
    profileImg,
} from '../constants/constants.js';
import { Friend, UserInfo, UserStats } from '../constants/structs.js';
import { getUser, logOutApi, checkUnread } from '../remote_storage/remote_storage.js';
import { showFriendsDropdown } from '../templates/freinds_menu.js';
import { buildMenuItems, getMenuEntries, showMenu } from '../templates/menu.js';
import { showErrorMessage } from '../templates/popup_message.js';
import { removeEventListenerByClone } from '../utils/remove_eventlistener.js';
import { render_with_delay } from '../utils/render_with_delay.js';
import { lang, t } from '../constants/language_vars.js';
import { LANGUAGE } from '../constants/gloabal.js';
import { navigateTo } from './history_views.js';

export function getPos() {
    const windowHash = window.location.hash.replace(/^#/, '');
    const pos = windowHash.split('?')[0];
    return pos;
}

async function updateOnlineUser(friends: Friend[]) {
    if (!friendsNumber) {
        return;
    }
    const now = Date.now();
    const FIVE_MINUTES_MS = 5 * 60 * 1000;
    let count = 0;
    for (const f of friends) {
        if (
            f.last_seen &&
            now - new Date(f.last_seen + ' UTC').getTime() <= FIVE_MINUTES_MS
        ) {
            count++;
        }
    }
    const hasUnread = await updateUnreadMessage(friends);
    friendsNumber.textContent = count.toLocaleString() + (hasUnread ? ' 📩' : '');

}

async function updateUnreadMessage(friends: Friend[]): Promise<boolean> {

    const checks = await Promise.all(
        friends.map(f => checkUnread(f.id))
    );
    return checks.includes(1);
}

let profileMenuListenerAttached = false;

export async function render_header() {
    const pos = getPos();

    const friendsCotnainer = document.getElementById('FriendsContainer');

	const headerTitle = document.getElementById("headline");

    if (
        !friendsCotnainer ||
        !profileImg ||
        !profile ||
        !headernavs ||
        !profileContainer ||
        !friendsNumber ||
        !friendsBtn
    ) {
        showErrorMessage(t(lang.databaseError, LANGUAGE));
        logOutApi();
        render_with_delay('login');
        return;
    }
    friendsCotnainer.innerHTML = t(lang.friends, LANGUAGE);
    console.log(pos);
    if (
        pos !== 'login' &&
        pos !== 'register' &&
        pos !== 'email_validation' &&
        pos !== 'two_fa'
    ) {
        headernavs.classList.remove('hidden');
    } else {
        headernavs.classList.add('hidden');
        return;
    }

    const userData = await getUser();
	if (pos !== "login" && pos !== "register" && pos !== "email_validation" && pos !== "two_fa" && pos !== "matchmaking") {
		headernavs.classList.remove('hidden');
		if (headerTitle) {
			headerTitle.onclick = () => {
				navigateTo('dashboard')
			}
		}
	} else {
		headernavs.classList.add('hidden');
		return;
	}

    if (!userData) {
        showErrorMessage(t(lang.databaseError, LANGUAGE));
        logOutApi();
        render_with_delay('login');
        return;
    }

    const user: UserInfo = userData.user;

    const friends: Friend[] = userData.friends;

    const safePath = user.path
        ? `/api/get/getImage?filename=${encodeURIComponent(user.path)}`
        : '/api/get/getImage?filename=std_user_img.png';

    profileImg.src = safePath;

    profile.innerHTML = user.username;

    updateOnlineUser(friends);

    friendsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showFriendsDropdown();
    });

    removeEventListenerByClone(MENU_CONTAINER_ID);
    if (!profileMenuListenerAttached) {
        profileContainer.addEventListener('click', (e) => {
            e.stopPropagation();
            const pos = getPos();
            const items = buildMenuItems(getMenuEntries(pos));
            showMenu(items);
        });
        profileMenuListenerAttached = true;
    }
}

let intervalId: ReturnType<typeof setInterval>;

intervalId = setInterval(async () => {
    const pos = getPos();

    if (
        pos == 'login' ||
        pos == 'register' ||
        pos == 'two_fa' ||
        pos == 'email_validation'
    ) {
        clearInterval(intervalId);
        return;
    }

    const user = await getUser();
    if (!user) {
        return;
    }
    const friends: Friend[] = user.friends;
    updateOnlineUser(user.friends);
}, 10000);
