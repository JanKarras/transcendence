const db = require("../db");

function getUserById(userId) {
    return db.prepare(`
        SELECT username, path 
        FROM users 
        WHERE id = ?
    `).get(userId); // nur ein Ergebnis statt Array
}

module.exports = {
    getUserById
};