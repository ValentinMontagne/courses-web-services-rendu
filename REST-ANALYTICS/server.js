// All other imports here.
const express = require("express");
const { MongoClient } = require("mongodb");
const z = require("zod");
const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

app.use(express.json());

// Product Schema + Product Route here.

// Init mongodb client connection
client.connect().then(() => {
  // Select db to use in mongodb
  db = client.db("myDB");
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
});

// Schemas
const ViewSchema = z.object({
  _id: z.string(),
  souce: z.string(),
  url: z.string(),
  action: z.string(),
  visitor: z.string(),
  createdAt: z.date(),
  meta: z.array()
});

const ActionSchema = z.object({
  _id: z.string(),
  souce: z.string(),
  url: z.string(),
  action: z.string(),
  visitor: z.string(),
  reatedAt: z.date(),
  meta: z.array()
});

const GoalSchema = z.object({
  _id: z.string(),
  souce: z.string(),
  url: z.string(),
  action: z.string(),
  visitor: z.string(),
  createdAt: z.date(),
  meta: z.array()
});c