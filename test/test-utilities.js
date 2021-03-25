/* test-utilities.js - a set of commonly used functions */

const firebase = require("@firebase/rules-unit-testing");
const PROJECT_ID = "se06-website";

/**
 * initialises a firestore test instance, with optional auth parameter
 * @param {object} auth - the auth object (request.auth) used when making
 * requests to the firestore
 * @returns {firebase.firestore.Firestore} a instance of a empty firestore
 */
function getFirestore(auth){
    return firebase.initializeTestApp({projectId: PROJECT_ID, auth: auth}).firestore();
}

/**
 * initialises a firestore test instance, with admin privileges
 * @returns {firebase.firestore.Firestore} a instance of a empty firestore
 */
function getAdminFirestore(){
    return firebase.initializeAdminApp({projectId: PROJECT_ID}).firestore();
}

module.exports = {
    getFirestore, getAdminFirestore, firebase,
}