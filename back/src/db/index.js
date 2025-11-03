const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, '../../database/mydatabase.sqlite');
const db = new Database(dbPath);

global.db = db;

function runScriptsFromDir(dir) {
	const absoluteDir = path.resolve(__dirname, dir);
	const files = fs.readdirSync(absoluteDir);

	files.forEach(file => {
		if (file.endsWith('.js')) {
			require(path.join(absoluteDir, file));
		}
	});
}
runScriptsFromDir('./schemes');

require('./seeds/init_user.js');

require('./seeds/init_matches.js');


module.exports = db;
