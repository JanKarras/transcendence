const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function getUserIdFromRequest(req) {
    try {
        const token = req.cookies?.auth_token;
        if (!token) {
            return null;
        }

        const payload = jwt.verify(token, JWT_SECRET);

        if (payload && typeof payload.id === 'number') {
            return payload.id;
        }

        return null;
    } catch(err) {
        return null;
    }
}

module.exports = {
    getUserIdFromRequest,
}