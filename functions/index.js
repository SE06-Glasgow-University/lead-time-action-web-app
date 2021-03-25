// index.js

// get private config files
const {firebase} = require("./firebase-setup");
const {githubAuthConfig} = require("./githubAuthConfig");

// database functions
const {createNewUser, getGraphData, getUser} = require("./dbFunctions");
const functions = require("firebase-functions");

const express = require("express");
const engines = require("consolidate");

const axios = require("axios");

// setup express to use ejs as view engine
const app = express();
app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({extended: false}));

/**
 * allows user to pass through route if logged in
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @param {function} next - the next function which redirects to the next url
 * @return {Promise<void>} allows user to pass through to next or redirects to login
 */
const authMiddleware = async (req, res, next) => {
  if (await isUserLoggedIn()) {
    next();
  } else {
    res.redirect("/app/github");
  }
};

const logoutUser = async () => {
  await firebase.auth().signOut();
};

/**
 * check if a user is logged in
 * @return {Promise<boolean>} true if logged in, false otherwise
 */
const isUserLoggedIn = async () => {
  return !!firebase.auth().currentUser;
};

const getCurrentUser = async () => {
  return firebase.auth().currentUser;
};


const firebaseLoginGitHub = async (code) => {
  try {
    const githubResponse = await axios.post("https://github.com/login/oauth/access_token", {
      client_id: githubAuthConfig.clientId,
      client_secret: githubAuthConfig.clientSecret,
      code: code,
    }, {
      headers: {
        "Accept": "application/json",
      },
    });

    const token = githubResponse.data.access_token;
    const credential = firebase.auth.GithubAuthProvider.credential(token);
    const result = await firebase.auth().signInWithCredential(credential);


    if (result.additionalUserInfo.isNewUser === true) {
      const newUserDetails = {
        username: result.additionalUserInfo.username,
        photoURL: result.user.photoURL,
        displayName: result.user.displayName,
      };
      await createNewUser(result.user.uid, newUserDetails);
    }
  } catch (error) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.email;
    console.log(`${errorCode}: ${errorMessage} occurred with email ${email}`);
  }
};

/**
 * home page route
 */
app.get("/", async (req, res) => {
  // res.set("Cache-Control", "public, max-age=300, s-maxage=600");
  res.render("home", {loggedIn: await isUserLoggedIn()});
});

app.get("/logout", authMiddleware, async (req, res) => {
  await logoutUser();
  res.render("home", {loggedIn: await isUserLoggedIn()});
});

/**
 * github login route
 */
app.get("/github", (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?client_id=${githubAuthConfig.clientId}&scope=read:user`);
});

app.get("/callback", async (req, res) => {
  // if user has not logged in through github, redirect them to github login page
  if (req.query.code === undefined) {
    res.redirect("/app/github");
  }

  await firebaseLoginGitHub(req.query.code);

  res.render("home", {loggedIn: await isUserLoggedIn()});
});


/**
 * profile route to show user details and token
 */
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const currentUser = await getCurrentUser();
    const userDoc = await getUser(currentUser.uid);
    const profile = {
      username: userDoc.data().username,
      photoURL: userDoc.data().photoURL,
      displayName: userDoc.data().displayName,
      token: userDoc.data().token,
    };
    res.render("profile", {profile, error: undefined, loggedIn: await isUserLoggedIn()});
  } catch (error) {
    const errorMessage = error.message;
    res.render("profile", {errorMessage: errorMessage, serverRes: undefined, loggedIn: await isUserLoggedIn()});
  }
});

/**
 * graph login route allowing users to get graph data
 */
app.get("/graph-login", async (req, res) => {
  // res.set("Cache-Control", "public, max-age=300, s-maxage=600");
  res.render("graph-login", {loggedIn: await isUserLoggedIn()});
});


app.post("/graph", authMiddleware, (req, res) => {
  res.redirect(`/app/graph/${req.body.repoName}/${req.body.numReleases}`);
});

/**
 * route to get graph data for given repo on authenticated user
 */
app.get("/graph/:repoName/:numReleases", authMiddleware, async (req, res) => {
  // res.set("Cache-Control", "private, max-age=300, s-maxage=600");

  const user = await getCurrentUser();
  const uid = user.uid;
  const userDoc = await getUser(uid);

  const query = {
    username: userDoc.data().username,
    repoName: req.params.repoName,
    numReleases: req.params.numReleases,
  };

  const response = await getGraphData(uid, query);

  if (response.error !== undefined) {
    // no data
    res.render("show-graph", {repo: query.repoName, errorMessage: response.error, loggedIn: await isUserLoggedIn()});
  } else {
    const labels = [];
    const leadTimes = [];
    const tags = [];

    response.forEach((doc) => {
      labels.push(new Date(doc.created_at).toLocaleDateString());
      leadTimes.push(doc.lead_time);
      tags.push(doc.tag_name);
    });

    res.render("show-graph", {labels, leadTimes, tags, repo: query.repoName, errorMessage: undefined,
      loggedIn: await isUserLoggedIn()});
  }
});

exports.api = require("./addGraphData");
exports.app = functions.region("europe-west3").https.onRequest(app);
