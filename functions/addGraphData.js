// addGraphData.js

const {authenticate} = require("./utilities");
const {db} = require("./firebase-setup");
const functions = require("firebase-functions");
const app = require("express")();

/**
 * endpoint to add data about single release to database
 */
app.post("/graph/add-data", async (req, res) => {
  try {
    if (await authenticate(req.body.ownerName, req.body.token)) {
      const data = {
        created_at: req.body.created_at,
        lead_time: req.body.lead_time,
        ownerName: req.body.ownerName,
        repoName: req.body.repoName,
        tag: req.body.tag,
      };

      await db.collection("data").add(data);

      const returnData = {
        message: `Successfully added commit data for repo ${req.body.repoName}`,
      };
      return res.status(201).json(returnData);
    } else {
      return res.status(401).send("Invalid credentials!");
    }
  } catch (error) {
    return res.status(500).json({error: error.toString()});
  }
});

exports.endpoints = functions.region("europe-west3")
    .https.onRequest(app);
