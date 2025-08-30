
function validateFriendId(friendId) {
    return Number.isInteger(friendId) && friendId > 0;
}

module.exports = {
    validateFriendId
}