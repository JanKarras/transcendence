exports.getHello = async (req, res) => { return { msg: 'hello' }; };
exports.getUser = async (req, res) => { return { user: 'Max' }; };
exports.getStats = async (req, res) => { return { stats: [1, 2, 3] }; };
