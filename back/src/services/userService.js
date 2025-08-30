const userRepository = require("../repositories/userRepository");

function getUserByEmailOrUsername(username) {
    let user = userRepository.getUserByUsername(username);
    if (!user) {
        user = userRepository.getUserByEmail(username);
    }
    return user;
}

function updateUser(firstName, lastName, age, imageName, userId) {
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
        userRepository.updateUserImageName(imageName, userId);
    }
}

module.exports = {
    getUserByEmailOrUsername,
    updateUser,
}