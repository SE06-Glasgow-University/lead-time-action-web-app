// utilities.js

const {db} = require("./firebase-setup");

/**
 * checks if user exists in user collection given uid
 * @param {string} uid - the uid of the user to get
 * @return {Promise<boolean>} resolves true if document exists with docID = uid, false otherwise
 */
const userExists = async (uid) => {
  const doc = await db.doc(`/users/${uid}`).get();
  return doc.exists;
};

/**
 * checks if given userToken matches token field in document with given username
 * @param {string} username - the username to search for in users collection
 * @param {string} userToken = the token used to authenticate incoming request
 * @return {Promise<boolean>} - resolves true if username and userToken exist in users collection, false otherwise
 */
const authenticate = async (username, userToken) => {
  try {
    const snapshot = await db.collection("users").where("username", "==", username).get();
    if (snapshot.empty) {
      // no such user
      return false;
    }

    snapshot.forEach((doc) => {
      return (userToken === doc.data().token);
    });
  } catch (error) {
    console.log(error.message);
    return false;
  }
};

module.exports = {authenticate, userExists};
