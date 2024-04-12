const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const z = require("zod");

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

app.use(express.json());

// Init mongodb client connection
client.connect().then(() => {
  // Select db to use in mongodb
  db = client.db("myDB");
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
});

// Schemas for views, actions, and goals
const LogSchema = z.object({
  source: z.string(),
  url: z.string(),
  visitor: z.string(),
  createdAt: z.date(new Date()),
  meta: z.record(z.unknown()), 
});

const CreateLogSchema = LogSchema.omit({ createdAt: true });

// Route to create a new log entry
app.post("/views", async (req, res) => {
  const result = await CreateLogSchema.safeParse(req.body);

  // If Zod parsed successfully the request body
  if (result.success) {
    const { source, url, visitor, meta } = result.data;

    const ack = await db.collection("views").insertOne({
      source,
      url,
      visitor,
      createdAt: new Date(),
      meta,
    });

    res.send({ _id: ack.insertedId, source, url, visitor, meta });
  } else {
    res.status(400).send(result.error);
  }
});

// Route to create a new action entry
app.post("/actions", async (req, res) => {
  const result = await CreateLogSchema.safeParse(req.body);

  // If Zod parsed successfully the request body
  if (result.success) {
    const { source, url, action, visitor, meta } = result.data;

    const ack = await db.collection("actions").insertOne({
      source,
      url,
      action,
      visitor,
      createdAt: new Date(),
      meta,
    });

    res.send({ _id: ack.insertedId, source, url, action, visitor, meta });
  } else {
    res.status(400).send(result.error);
  }
});

// Route to create a new goal entry
app.post("/goals", async (req, res) => {
  const result = await CreateLogSchema.safeParse(req.body);

  // If Zod parsed successfully the request body
  if (result.success) {
    const { source, url, goal, visitor, meta } = result.data;

    const ack = await db.collection("goals").insertOne({
      source,
      url,
      goal,
      visitor,
      createdAt: new Date(),
      meta,
    });

    res.send({ _id: ack.insertedId, source, url, goal, visitor, meta });
  } else {
    res.status(400).send(result.error);
  }
});

// Route to fetch all logs
app.get("/logs", async (req, res) => {
  try {
    const logs = await db.collection("views").find({}).toArray();
    res.send(logs);
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to fetch a log by ID
app.get("/logs/:id", async (req, res) => {
  const logId = req.params.id;
  try {
    const log = await db.collection("views").findOne({ _id: ObjectId(logId) });
    if (!log) {
      return res.status(404).send("Log not found");
    }
    res.send(log);
  } catch (error) {
    console.error("Error fetching log:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to update a log
app.put("/logs/:id", async (req, res) => {
  const logId = req.params.id;
  const updates = req.body;
  try {
    const result = await db.collection("views").updateOne(
      { _id: ObjectId(logId) },
      { $set: updates }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).send("Log not found");
    }
    res.send("Log updated successfully");
  } catch (error) {
    console.error("Error updating log:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to delete a log
app.delete("/logs/:id", async (req, res) => {
  const logId = req.params.id;
  try {
    const result = await db.collection("views").deleteOne({ _id: ObjectId(logId) });
    if (result.deletedCount === 0) {
      return res.status(404).send("Log not found");
    }
    res.send("Log deleted successfully");
  } catch (error) {
    console.error("Error deleting log:", error);
    res.status(500).send("Internal Server Error");
  }
});
