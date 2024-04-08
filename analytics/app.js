const { MongoClient, ObjectId} = require("mongodb");
const express = require("express");
const z = require("zod");

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;
let collection;

app.use(express.json());

const ViewsSchema = z.object({
    source: z.string(),
    url: z.string(),
    visitor: z.string(),
    createdAt: z.string().refine(value => isValidISODate(value), {
        message: "Invalid createdAt format. Expected ISO 8601 date."
    }),
    meta: z.record(z.unknown()),
});

const ActionsSchema = z.object({
    source: z.string(),
    url: z.string(),
    action: z.string(),
    visitor: z.string(),
    createdAt: z.string().refine(value => isValidISODate(value), {
        message: "Invalid createdAt format. Expected ISO 8601 date."
    }),
    meta: z.record(z.unknown()),
});

const GoalsSchema = z.object({
    source: z.string(),
    url: z.string(),
    goal: z.string(),
    visitor: z.string(),
    createdAt: z.string().refine(value => isValidISODate(value), {
        message: "Invalid createdAt format. Expected ISO 8601 date."
    }),
    meta: z.record(z.unknown()),
});

function isValidISODate(dateString) {
    return !isNaN(Date.parse(dateString));
}


client.connect().then(async () => {

    db = client.db("myDBAnalytics");
    collection = db.collection("myCollection")
    app.listen(port, () => {
        console.log(`Listening on http://localhost:${port}`);
    });
})

app.post("/views", async (req, res) => {
    const result = await ViewsSchema.safeParse(req.body);

    if (result.success){
        const { source , url, visitor, createdAt, meta } = result.data;
        const createdAtDate = new Date(createdAt);
        await db
            .collection("views")
            .insertOne({source, url, visitor, createdAt: createdAtDate, meta});
        res.send({
            source,
            url,
            visitor,
            createdAt: createdAtDate,
            meta,
        });
    } else {
        res.status(400).send(result);
    }
});
app.get("/views", async (req, res) => {
    try {
        const views = await db.collection("views").find().toArray();
        res.send(views);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/actions", async (req, res) => {
    const result = await ActionsSchema.safeParse(req.body);

    if (result.success){
        const { source , url, action, visitor, createdAt, meta } = result.data;
        const createdAtDate = new Date(createdAt);
        await db
            .collection("actions")
            .insertOne({ source, url, action, visitor, createdAt: createdAtDate, meta });
        res.send({
            source,
            url,
            action,
            visitor,
            createdAt: createdAtDate,
            meta,
        });
    } else {
        res.status(400).send(result);
    }
});

app.get("/actions", async (req, res) => {
    try {
        const actions = await db.collection("actions").find().toArray();
        res.send(actions);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.post("/goals", async (req, res) => {
    const result = await GoalsSchema.safeParse(req.body);

    if (result.success){
        const { source , url, goal, visitor, createdAt, meta } = result.data;
        const createdAtDate = new Date(createdAt);
        await db
            .collection("goals")
            .insertOne({ source, url, goal, visitor, createdAt: createdAtDate, meta });
        res.send({
            source,
            url,
            goal,
            visitor,
            createdAt: createdAtDate,
            meta,
        });
    } else {
        res.status(400).send(result);
    }
});

app.get("/goals", async (req, res) => {
    try {
        const goals = await db.collection("goals").find().toArray();
        res.send(goals);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/goals/:goalId/details", async (req, res) => {
    const goalId = req.params.goalId;

    try {
        const goal = await db.collection("goals").findOne({ _id: new ObjectId(goalId) });

        if (!goal) {
            return res.status(404).send("Goal not found");
        }

        const details = await db.collection("goals").aggregate([
            { $match: { _id: new ObjectId(goalId) } },
            {
                $lookup: {
                    from: "views",
                    localField: "visitor",
                    foreignField: "visitor",
                    as: "views"
                }
            },
            {
                $lookup: {
                    from: "actions",
                    localField: "visitor",
                    foreignField: "visitor",
                    as: "actions"
                }
            }
        ]).toArray();

        res.send(details);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

