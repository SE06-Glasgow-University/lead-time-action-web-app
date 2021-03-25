const PROJECT_ID = "se06-website";
const {firebase, getFirestore, getAdminFirestore} = require("../test-utilities");

describe("Data Collection Unit Tests",  () => {
    // clears the firestore emulator data before each test is run
    beforeEach(async () => {
        await firebase.clearFirestoreData({projectId: PROJECT_ID});
    });

    // clears the firestore emulator data after all tests run
    afterAll(async () =>{
        await firebase.clearFirestoreData({projectId: PROJECT_ID});
        await Promise.all(firebase.apps().map(app => app.delete()))
    });

    // setup fake users
    const user1 = "user1_abc";
    const user1Auth = {uid: user1}

    // setup fake data
    const data1 = "data_1";
    const data1Details = {
        created_at: "01/05/21",
        lead_time: "2.5",
        ownerName: "user1_name",
        repoName: "fakeRepoName",
        tag: "v1",
    };

    it('should allow creation of document if all required fields provided', async () => {
        const db = getFirestore(null);
        const testDoc = db.collection("data").doc(data1)
        await firebase.assertSucceeds(testDoc.set(data1Details));
    });

    it('should allow read if signed in as authenticated user', async () => {
        const admin = getAdminFirestore();
        // create user1 doc
        admin.collection("users").doc(user1);
        // setup a data doc containing user1's username
        const setupDoc = admin.collection("data").doc(data1);
        await setupDoc.set(data1Details);

        // login as user1 and get document
        const db = getFirestore(user1Auth);
        const testDoc = db.collection("data").doc(data1)
        await firebase.assertSucceeds(testDoc.get());
    });

    it('should not allow creation of document if all required fields not provided', async () => {
        const db = getFirestore(null);
        const testDoc = db.collection("data").doc(data1)
        await firebase.assertFails(testDoc.set({foo: "bar"}));
    });

    it('should not allow read if user not signed in', async () => {
        const admin = getAdminFirestore();
        // create user1 doc
        admin.collection("users").doc(user1);
        // setup a data doc containing user1's username
        const setupDoc = admin.collection("data").doc(data1);
        await setupDoc.set(data1Details);

        // do not sign in
        const db = getFirestore(null);
        const testDoc = db.collection("data").doc(data1)
        await firebase.assertFails(testDoc.get());
    });

    it('should not allow read if user does not exist in database', async () => {
        const admin = getAdminFirestore();
        // setup a data doc containing user1's username
        const setupDoc = admin.collection("data").doc(data1);
        await setupDoc.set(data1Details);

        // login as user1 and get document
        const db = getFirestore(user1Auth);
        const testDoc = db.collection("data").doc(data1)
        await firebase.assertFails(testDoc.get());
    });

});