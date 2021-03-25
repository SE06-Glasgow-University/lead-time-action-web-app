const PROJECT_ID = "se06-website";
const {firebase, getFirestore, getAdminFirestore} = require("../test-utilities");

describe("User Collection Unit Tests",  () => {
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
    const user1Details = {
        username: "username_abc",
        displayName: "John Doe",
        token: "qwertyuiop-asdfghjkl-zxcvbnm",
        photoURL: "www.img.com/v1",
    };

    const user2 = "user1_xyz";
    const user2Details = {
        username: "username_xyz",
        displayName: "Jane Appleseed",
        token: "zxcvbnm-asdfghjkl-qwertyuiop",
        photoURL: "www.img.com/v2",
    };

    it('should not read a user document if not authenticated', async () => {
        // setup a user document for user1
        const admin = getAdminFirestore();
        const setupDoc = admin.collection("users").doc(user1);
        await setupDoc.set(user1Details);

        // setup unauthenticated firestore access
        const db = getFirestore(null);
        const testRead = db.collection("users").doc(user1);
        await firebase.assertFails(testRead.get());
    });

    it('should not write to a user document if not authenticated', async () => {
        const db = getFirestore(null);
        const testDoc = db.collection("users").doc(user1)
        await firebase.assertFails(testDoc.set(user1Details));
    });

    it('should read a user document with the same ID as the auth user', async () => {
        // setup a user document for user1
        const admin = getAdminFirestore();
        const setupDoc = admin.collection("users").doc(user1);
        await setupDoc.set(user1Details);

        // read user1 document as user1
        const db = getFirestore(user1Auth);
        const testRead = db.collection("users").doc(user1);
        await firebase.assertSucceeds(testRead.get());
    });

    it('should write to a user document with the same ID as the auth user', async () => {
        const db = getFirestore(user1Auth);
        const testDoc = db.collection("users").doc(user1)
        await firebase.assertSucceeds(testDoc.set(user1Details));
    });

    it('should not read a user document with different ID from the auth user', async () => {
        // setup a user document for user1
        const admin = getAdminFirestore();
        const setupDoc = admin.collection("users").doc(user2);
        await setupDoc.set(user2Details);

        // read user1 document as user1
        const db = getFirestore(user1Auth);
        const testRead = db.collection("users").doc(user2);
        await firebase.assertFails(testRead.get());
    });

    it('should not write to user document with different ID from the auth user', async () => {
        const db = getFirestore(user1Auth);
        const testDoc = db.collection("users").doc(user2);
        await firebase.assertFails(testDoc.set({foo: "bar"}));
    });

    it('should not write to user document if required fields not provided', async () => {
        const db = getFirestore(user1Auth);
        const testDoc = db.collection("users").doc(user1);
        await firebase.assertFails(testDoc.set({foo: "bar"}));
    });

});