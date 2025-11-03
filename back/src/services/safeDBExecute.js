function safeDBExecute(callback, context = {}) {
	try {
		return callback();
	} catch (err) {
		console.error("❌ DB Error:", err.message, "Context:", context);
		return null;
	}
}

module.exports = { safeDBExecute };
