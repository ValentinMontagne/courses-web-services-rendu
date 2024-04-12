// All other imports here.
const { MongoClient,ObjectId } = require("mongodb");
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

const ViewSchema = z.object({
    source: z.string(),
    url: z.string(),
    visitor: z.string(),
});

// Schema for actions
const ActionSchema = z.object({
    source: z.string(),
    url: z.string(),
    action: z.string(),
    visitor: z.string(),
});

// Schema for goals
const GoalSchema = z.object({
    source: z.string(),

    url: z.string(),
    goal: z.string(),
    visitor: z.string(),
});

// Omitting _id for each schema to be used in create operations
const CreateViewSchema = ViewSchema.omit({ _id: true });
const CreateActionSchema = ActionSchema.omit({ _id: true });
const CreateGoalSchema = GoalSchema.omit({ _id: true });

// Routes for Views
app.post("/views", async (req, res) => {
    const result = await CreateViewSchema.safeParse(req.body);

    if (result.success) {
        const view = result.data;

        const ack = await db.collection("views").insertOne(view);
        res.status(201).json({ _id: ack.insertedId, ...view });
    } else {
        res.status(400).send(result.error);
    }
});

app.get("/views", async (req, res) => {
    const views = await db.collection("views").find({}).toArray();
    res.json(views);
});

app.put("/views/:viewId", async (req, res) => {
    const viewId = req.params.viewId;
    const result = await ViewSchema.safeParse(req.body);

    if (result.success) {
        const view = result.data;

        const ack = await db.collection("views").updateOne(
            { _id: ObjectId(viewId) },
            { $set: view }
        );

        if (ack.matchedCount === 1) {
            res.json({ _id: viewId, ...view });
        } else {
            res.status(404).send({ message: "View not found" });
        }
    } else {
        res.status(400).send(result.error);
    }
});

app.delete("/views/:viewId", async (req, res) => {
    const viewId = req.params.viewId;

    const ack = await db.collection("views").deleteOne({ _id: ObjectId(viewId) });

    if (ack.deletedCount === 1) {
        res.json({ message: "View deleted successfully" });
    } else {
        res.status(404).send({ message: "View not found" });
    }
});

// Routes for Actions
app.post("/actions", async (req, res) => {
    const result = await CreateActionSchema.safeParse(req.body);

    if (result.success) {
        const action = result.data;

        const ack = await db.collection("actions").insertOne(action);
        res.status(201).json({ _id: ack.insertedId, ...action });
    } else {
        res.status(400).send(result.error);
    }
});

app.get("/actions", async (req, res) => {
    const actions = await db.collection("actions").find({}).toArray();
    res.json(actions);
});

app.put("/actions/:actionId", async (req, res) => {
    const actionId = req.params.actionId;
    const result = await ActionSchema.safeParse(req.body);

    if (result.success) {
        const action = result.data;

        const ack = await db.collection("actions").updateOne(
            { _id: ObjectId(actionId) },
            { $set: action }
        );

        if (ack.matchedCount === 1) {
            res.json({ _id: actionId, ...action });
        } else {
            res.status(404).send({ message: "Action not found" });
        }
    } else {
        res.status(400).send(result.error);
    }
});

app.delete("/actions/:actionId", async (req, res) => {
    const actionId = req.params.actionId;

    const ack = await db.collection("actions").deleteOne({ _id: ObjectId(actionId) });

    if (ack.deletedCount === 1) {
        res.json({ message: "Action deleted successfully" });
    } else {
        res.status(404).send({ message: "Action not found" });
    }
});

// Routes for Goals
app.post("/goals", async (req, res) => {
    const result = await CreateGoalSchema.safeParse(req.body);

    if (result.success) {
        const goal = result.data;

        const ack = await db.collection("goals").insertOne(goal);
        res.status(201).json({ _id: ack.insertedId, ...goal });
    } else {
        res.status(400).send(result.error);
    }
});

app.get("/goals", async (req, res) => {
    const goals = await db.collection("goals").find({}).toArray();
    res.json(goals);
});

app.put("/goals/:goalId", async (req, res) => {
    const goalId = req.params.goalId;
    const result = await GoalSchema.safeParse(req.body);

    if (result.success) {
        const goal = result.data;

        const ack = await db.collection("goals").updateOne(
            { _id: ObjectId(goalId) },
            { $set: goal }
        );

        if (ack.matchedCount === 1) {
            res.json({ _id: goalId, ...goal });
        } else {
            res.status(404).send({ message: "Goal not found" });
        }
    } else {
        res.status(400).send(result.error);
    }
});

app.delete("/goals/:goalId", async (req, res) => {
    const goalId = req.params.goalId;

    const ack = await db.collection("goals").deleteOne({ _id: ObjectId(goalId) });

    if (ack.deletedCount === 1) {
        res.json({ message: "Goal deleted successfully" });
    } else {
        res.status(404).send({ message: "Goal not found" });
    }
});

app.get("/goals/:goalId/details", async (req, res) => {
    const goalId = req.params.goalId;

    try {
        // Find the goal by ID
        const goal = await db.collection("goals").findOne({ _id: ObjectId(goalId) });
        if (!goal) {
            return res.status(404).send({ message: "Goal not found" });
        }

        // Aggregate to find associated views and actions
        const details = await db.collection("views").aggregate([
            { $match: { goal: goal.goal } }, // Match views related to this goal
            {
                $lookup: {
                    from: "actions", // Join with the actions collection
                    localField: "visitor",
                    foreignField: "visitor",
                    as: "actions"
                }
            },
            {
                $project: {
                    _id: 1,
                    source: 1,
                    url: 1,
                    visitor: 1,
                    actions: 1
                }
            }
        ]).toArray();

        res.json({ goal, details });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});