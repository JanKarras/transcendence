import { NOTIFICATION_CONTAINER_ID } from "../constants/constants.js";
function getOrCreateContainer() {
    let container = document.getElementById(NOTIFICATION_CONTAINER_ID);
    if (!container) {
        container = document.createElement("div");
        container.id = NOTIFICATION_CONTAINER_ID;
        container.className = "fixed top-5 right-5 z-50 flex flex-col space-y-2 max-w-sm";
        document.body.appendChild(container);
    }
    return container;
}
function createNotificationElement(message, bgColor, textColor) {
    const notification = document.createElement("div");
    notification.className = `${bgColor} ${textColor} px-4 py-3 rounded shadow-md`;
    notification.textContent = message;
    setTimeout(() => {
        notification.classList.add("opacity-0", "transition-opacity", "duration-700");
        setTimeout(() => notification.remove(), 700);
    }, 3000);
    return notification;
}
export function showSuccessMessage(message) {
    const container = getOrCreateContainer();
    const notification = createNotificationElement(message, "bg-green-500", "text-white");
    container.appendChild(notification);
}
export function showErrorMessage(message) {
    const container = getOrCreateContainer();
    const notification = createNotificationElement(message, "bg-red-500", "text-white");
    container.appendChild(notification);
}
