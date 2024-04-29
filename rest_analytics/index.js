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
  db = client.db("myDB");
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
});

const ViewsSchema = z.object({
    _id: z.string(),
    source: z.string(),
    url: z.string(),
    visitor: z.string(),
    createdAt: z.date(),
    meta: z.object()
});

const CreateViewsSchema = ViewsSchema.omit({ _id: true });

const ActionsSchema = z.object({
    _id: z.string(),
    source: z.string(),
    url: z.string(),
    action: z.string(),
    visitor: z.string(),
    createdAt: z.date(),
    meta: z.object()
});

const CreateActionsSchema = ActionsSchema.omit({ _id: true });

const GoalsSchema = z.object({
    _id: z.string(),
    source: z.string(),
    url: z.string(),
    goal: z.string(),
    visitor: z.string(),
    createdAt: z.date(),
    meta: z.ZodObject()
});

const CreateGoalsSchema = GoalsSchema.omit({ _id: true });

app.post("/views", async (req, res) => {
    const result = await CreateViewsSchema.safeParse(req.body);

    if (result.success) {
        const { source, url, visitor, createdAt, meta } = result.data;

        const ack = await db
            .collection("views")
            .insertOne( {source, url, visitor, createdAt, meta })

            res.send({
                _id: ack.insertedId,
                source, 
                url, 
                visitor,
                createdAt,
                meta
            })
    }
})