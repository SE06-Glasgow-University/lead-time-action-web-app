// dbFunctions.js

const {db} = require("./firebase-setup");
const {v4: uuidv4} = require("uuid");

/**
 * creates a document in users collection with given uid as document ID
 * @param {string} uid - the uid of the authenticated user
 * @param {object} userDetails - the fields for the created document
 * @return {Promise<any>} returns the added fields if successful, error message otherwise
 */
const createNewUser = async (uid, userDetails) => {
  try {
    const token = uuidv4();

    await db.collection("users").doc(uid).set({...userDetails, token});

    return {...userDetails, token};
  } catch (e) {
    console.log(e);
    return {...userDetails, error: "could not create account"};
  }
};

/**
 * gets specific document in user collection by uid
 * @param {string} uid - the uid of the authenticated user
 * @return {Promise<firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>|null>}
 * document snapshot if found, null otherwise
 */
const getUser = async (uid) => {
  try {
    const userDoc = await db.collection("users").doc(uid).get();

    if (!userDoc.exists) {
      // user doesnt exist
      return null;
    }

    return userDoc;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};

/**
 * gets documents in repo collection for given username and repo name
 * @param {string} uid - the uid of the authenticated user
 * @param {object} query - the username, repo name and number of releases to query for
 * @return {Promise<{error: string}|[]>} returns array of objects matching the query,
 * error otherwise
 */
const getGraphData = async (uid, query) => {
  try {
    const returnData = [];
    const data = await db.collection("data")
        .where("ownerName", "==", query.username)
        .where("repoName", "==", query.repoName)
        .orderBy("created_at", "desc").limit(query.numReleases).get();

    data.forEach((doc) => {
      returnData.unshift({
        repo: doc.data().repoName,
        owner: doc.data().ownerName,
        created_at: doc.data().created_at,
        lead_time: doc.data().lead_time,
        tag_name: doc.data().tag,
      });
    });

    if (returnData.length === 0) {
      return {error: `no data for repo ${query.username}/${query.repoName}`};
    }

    return returnData;
  } catch (e) {
    console.log(e);
    return {error: "unknown error"};
  }
};

module.exports = {createNewUser, getUser, getGraphData};
