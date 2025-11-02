const userRepository = require("../repositories/userRepository");
const fs = require("fs");
const path = require("path");

function getUserByEmailOrUsername(username) {
	let user = userRepository.getUserByUsername(username);
	if (!user) {
		user = userRepository.getUserByEmail(username);
	}
	return user;
}

function updateUser(firstName, lastName, age, imageName, userId, twofa_active, twofa_method) {
	if (firstName) {
		userRepository.updateUserFirstName(firstName, userId);
	}
	if (lastName) {
		userRepository.updateUserLastName(lastName, userId);
	}
	if (age !== null) {
		userRepository.updateUserAge(age, userId);
	}
	if (imageName) {
		const oldUser = userRepository.getUserById(userId);
		if (oldUser && oldUser.path && oldUser.path !== "std_user_img.png") {
			try {
				const oldPath = path.join(__dirname, '../../profile_images', oldUser.path);
				if (fs.existsSync(oldPath)) {
					fs.unlinkSync(oldPath);
				}
			} catch (err) {
				console.error("Error deleting old image:", err);
			}
		}
		userRepository.updateUserImageName(imageName, userId);
	}
	if (twofa_active !== undefined) {
		userRepository.updateUserTwofaActive(twofa_active, userId);
	}
	if (twofa_method) {
		userRepository.updateUserTwoFaMethod(twofa_method, userId);
	}
}

module.exports = {
	getUserByEmailOrUsername,
	updateUser,
}
