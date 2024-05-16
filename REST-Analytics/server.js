const express = require("express");
const z = require("zod");
const { MongoClient, ObjectId} = require("mongodb");
const app = express();
const port = 8000;

let db;

const client = new MongoClient("mongodb://127.0.0.1:27017", );

client.connect()
    .then(() => {
        console.log("Connected to the database");
        db = client.db("test");
        app.locals.db = db;
    })
    .catch(err => console.error("Error connecting to the database", err));

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});

app.use(express.json());

const viewsSchema = z.object({
    _id: z.string(),
    source: z.string(),
    url: z.string(),
    visitor: z.string(),
    createdAt: z.string().datetime(),
    meta: z.record(z.string()),
});
const CreateViewsSchema = viewsSchema.omit({ _id: true });

const actionsSchema = z.object({
    _id: z.string(),
    source: z.string(),
    url: z.string(),
    action: z.string(),
    visitor: z.string(),
    createdAt: z.string().datetime(),
    meta: z.object({
    }),
});
const CreateActionsSchema = actionsSchema.omit({ _id: true });

const goalSchema = z.object({
    _id: z.string(),
    source: z.string(),
    url: z.string(),
    goal: z.string(),
    visitor: z.string(),
    createdAt: z.string().datetime(),
    meta: z.object({
    }),
});
const CreateGoalSchema = goalSchema.omit({ _id: true });

app.post("/views", async (req, res) => {
    const result = CreateViewsSchema.safeParse(req.body);

    if (result.success) {
        const { source, url, visitor, createdAt, meta } = result.data;

        const createdAtDate = new Date(createdAt);

        if (isNaN(createdAtDate.getTime())) {
            return res.status(400).send("Invalid date format for createdAt");
        }

        const ack = await db.collection("views").insertOne({ source, url, visitor, createdAt: createdAtDate, meta });

        res.send({ _id: ack.insertedId, source, url, visitor, createdAt: createdAtDate, meta });
    } else {
        res.status(400).send(result);
    }
});

app.post("/actions", async (req, res) => {
    const result = CreateActionsSchema.safeParse(req.body);

    if (result.success) {
        const { source, url, action, visitor, createdAt, meta } = result.data;

        const createdAtDate = new Date(createdAt);

        if (isNaN(createdAtDate.getTime())) {
            return res.status(400).send("Invalid date format for createdAt");
        }

        const ack = await db.collection("actions").insertOne({ source, url, action, visitor, createdAt: createdAtDate, meta });

        res.send({ _id: ack.insertedId, source, url, action, visitor, createdAt: createdAtDate, meta });
    } else {
        res.status(400).send(result);
    }
});

app.post("/goals", async (req, res) => {
    const result = CreateGoalSchema.safeParse(req.body);

    if (result.success) {
        const { source, url, goal, visitor, createdAt, meta } = result.data;

        const createdAtDate = new Date(createdAt);

        if (isNaN(createdAtDate.getTime())) {
            return res.status(400).send("Invalid date format for createdAt");
        }

        const ack = await db.collection("goals").insertOne({ source, url, goal, visitor, createdAt: createdAtDate, meta });

        res.send({ _id: ack.insertedId, source, url, goal, visitor, createdAt: createdAtDate, meta });
    } else {
        res.status(400).send(result);
    }
});

app.get("/goals/:goalId/details", async (req, res) => {
    const { goalId } = req.params;

    const goal = await db.collection("goals").findOne({ _id: new ObjectId(goalId) });

    if (!goal) {
        return res.status(404).send("Goal not found");
    }

    // Établir une connexion à la base de données avant d'utiliser db.order
    const orderCollection = db.collection("order");

    orderCollection.aggregate([
        {
            $match: { _id: new ObjectId(goalId) }
        },
        {
            $lookup: {
                from: "actions",
                localField: "goal",
                foreignField: "goal",
                as: "actions"
            }
        }
    ]).toArray((err, result) => {
        if (err) {
            return res.status(500).send("Error processing the request");
        }
        res.send(result);
    });
});
