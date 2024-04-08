/* IMPORTS */
const express = require("express");
const z = require("zod");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

/* */

/* INIT CONNECTION */
client.connect().then(() => {
    // Select db to use in mongodb
    db = client.db("myDB");
    app.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`);
    });
  });