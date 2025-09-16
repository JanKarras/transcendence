const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function getUserIdFromRequest(req) {
    const token = req.cookies?.auth_token;
    return getUserIdFromToken(token);
}

function getUserIdFromToken(token) {
    try {
        if (!token) {
            return null;
        }

        const payload = jwt.verify(token, JWT_SECRET);

        if (payload && typeof payload.id === 'number') {
            return payload.id;
        }

        return null;
    } catch (err) {
        return null;
    }
}

module.exports = {
    getUserIdFromRequest,
    getUserIdFromToken,
}