const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const z = require("zod");

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

app.use(express.json());

const ViewSchema = z.object({
  source: z.string(),
  url: z.string(),
  visitor: z.string(),
  createdAt: z.date(),
  meta: z.record(z.unknown()), 
});

const ActionSchema = ViewSchema.extend({
  action: z.string(),
});

const GoalSchema = ViewSchema.extend({
  goal: z.string(),
});

// Route pour créer une vue
app.post("/views", async (req, res) => {
  const result = ViewSchema.safeParse(req.body);

  if (result.success) {
    const { source, url, visitor, createdAt, meta } = result.data;

    const ack = await db.collection("views").insertOne({ source, url, visitor, createdAt, meta });

    res.send({ _id: ack.insertedId, source, url, visitor, createdAt, meta });
  } else {
    res.status(400).send(result.error);
  }
});

// Route pour créer une action
app.post("/actions", async (req, res) => {
  const result = ActionSchema.safeParse(req.body);

  if (result.success) {
    const { source, url, visitor, createdAt, meta, action } = result.data;

    const ack = await db.collection("actions").insertOne({ source, url, visitor, createdAt, meta, action });

    res.send({ _id: ack.insertedId, source, url, visitor, createdAt, meta, action });
  } else {
    res.status(400).send(result.error);
  }
});

// Route pour créer un objectif
app.post("/goals", async (req, res) => {
  const result = GoalSchema.safeParse(req.body);

  if (result.success) {
    const { source, url, visitor, createdAt, meta, goal } = result.data;

    const ack = await db.collection("goals").insertOne({ source, url, visitor, createdAt, meta, goal });

    res.send({ _id: ack.insertedId, source, url, visitor, createdAt, meta, goal });
  } else {
    res.status(400).send(result.error);
  }
});

// Route pour récupérer les détails d'un objectif avec agrégation
app.get("/goals/:goalId/details", async (req, res) => {
  const goalId = req.params.goalId;

  // Utilisation d'une agrégation pour obtenir les vues et actions associées à l'objectif
  const details = await db.collection("goals").aggregate([
    { $match: { _id: new ObjectId(goalId) } },
    {
      $lookup: {
        from: "views",
        localField: "visitor",
        foreignField: "visitor",
        as: "views",
      },
    },
    {
      $lookup: {
        from: "actions",
        localField: "visitor",
        foreignField: "visitor",
        as: "actions",
      },
    },
  ]).toArray();

  if (details.length > 0) {
    res.send(details[0]);
  } else {
    res.status(404).send({ error: "Goal not found" });
  }
});

// Init mongodb client connection
client.connect().then(() => {
  db = client.db("myDB");
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
});
