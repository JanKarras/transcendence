const userRepository = require("../repositories/userRepository")

exports.getAlias = async function (req, reply) {
	try {
		// 🔍 hole username egal ob Query oder Param
		const username = req.query?.username || req.params?.username;

		console.log("🔍 getAlias called with:", username);

		if (!username || username.trim() === "") {
			return reply.code(400).send({ error: "No username provided" });
		}

		const alias = await userRepository.getAlias(username);

		if (!alias) {
			return reply.code(404).send({ alias: null });
		}

		return reply.code(200).send({ alias });
	} catch (err) {
		console.error("❌ [getAlias] Error:", err);
		return reply.code(500).send({ error: "Internal Server Error" });
	}
};
