// All other imports here.
const { MongoClient, ObjectId } = require("mongodb");
const z = require("zod");
const express = require("express");

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

app.use(express.json());

// Product Schema + Product Route here.

// Init mongodb client connection
client.connect().then(() => {
  // Select db to use in mongodb
  db = client.db("AnalyticsDb");
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
});

const viewsSchema = z.object({
  _id: z.string(),
  url: z.string(),
  visitor: z.string(),
  createdAt: z.number().positive(),
  meta: z.object(),
});
const CreateViewsSchema = viewsSchema.omit({ _id: true, createdAt: true });

app.post("/views", async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: "Request body is missing" });
  }

  const result = CreateViewsSchema.safeParse(req.body);

  if (result.success) {
    const { url, visitor, meta } = result.data;
    const ack = await db
      .collection("views")
      .insertOne({ url, visitor, createdAt: new Date().getTime(), meta });
    return res.status(201).json({ _id: ack.insertedId });
  } else {
    return res
      .status(400)
      .json({ error: "Invalid request body", details: result.error });
  }
});
