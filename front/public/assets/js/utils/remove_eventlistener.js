export function removeEventListenerByClone(id) {
    const el = document.getElementById(id);
    if (!el || !el.parentNode) {
        return;
    }
    const cleanClone = el.cloneNode(true);
    el.parentNode.replaceChild(cleanClone, el);
}
