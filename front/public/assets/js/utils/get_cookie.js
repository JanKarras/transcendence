export function get_cookie(name) {
    var _a;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return ((_a = parts.pop()) === null || _a === void 0 ? void 0 : _a.split(';').shift());
    }
    return null;
}
