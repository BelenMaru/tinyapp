const bcrypt = require("bcrypt");

//find a user object containing a matching email

const findUserByEmail = (email, users) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

function generateRandomString() {
  let randomString = '';
  const characterList = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let x = 0; x < 6; x += 1) {
    randomString += characterList.charAt(Math.floor(Math.random() * characterList.length));
  }
  return randomString;

}

// URL for user
const urlsForUser = function (user_id, urlDatabase) {
  const results = {};
  for (let urlKey in urlDatabase) {
    const url = urlDatabase[urlKey];
    if (url.userID === user_id) {
      results[urlKey] = url;
    }
  }
  return results;
};

//Authenticate User

const authenticateUser = (email, password, users) => {
  const userFound = findUserByEmail(email, users);
  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    return userFound;
  }
  return false;
};

module.exports = {
  findUserByEmail,
  generateRandomString,
  authenticateUser,
  urlsForUser,
};

