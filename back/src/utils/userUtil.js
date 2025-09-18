const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const userUtilsRepo = require("../repositories/userUtilsRepository");
const { compareSync } = require('bcrypt');

function getUserIdFromRequest(req) {
    const token = req.cookies?.auth_token;
    return getUserIdFromToken(token);
}

function getUserIdFromToken(token) {
    try {
        if (!token) {
            console.log("No token provided");
            return null;
        }
        console.log("Decoding token:", token);
        const payload = jwt.verify(token, JWT_SECRET);
        if (payload && typeof payload.id === 'number') {
            console.log("Verified user ID from token:", payload.id);
            return payload.id;
        }
        console.log("Token payload invalid:", payload);
        return null;
    } catch (err) {
        console.error("JWT verification failed:", err.message);
        return null;
    }
}


function getUser(userId) {
    const res = userUtilsRepo.getUserById(userId);
    return (res);
}

module.exports = {
    getUserIdFromRequest,
    getUserIdFromToken,
    getUser
}
