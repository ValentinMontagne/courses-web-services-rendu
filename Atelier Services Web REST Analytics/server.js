const express = require("express");
const mongoose = require("mongoose");

const app = express();
const port = 8000;

// Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/rest-analytics");

// Modèles
const viewSchema = new mongoose.Schema({
  source: String,
  url: String,
  visitor: String,
  createdAt: { type: Date, default: Date.now },
  meta: Object,
});
const View = mongoose.model("View", viewSchema);

const actionSchema = new mongoose.Schema({
  type: String,
  visitor: String,
  createdAt: { type: Date, default: Date.now },
  meta: Object,
});
const Action = mongoose.model("Action", actionSchema);

const goalSchema = new mongoose.Schema({
  name: String,
  visitor: String,
  createdAt: { type: Date, default: Date.now },
  meta: Object,
});
const Goal = mongoose.model("Goal", goalSchema);

// Routes
app.get("/views", async (req, res) => {
  try {
    const views = await View.find();
    res.json(views);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/views", async (req, res) => {
  const view = new View(req.body);
  try {
    const newView = await view.save();
    res.status(201).json(newView);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/actions", async (req, res) => {
  try {
    const actions = await Action.find();
    res.json(actions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/actions", async (req, res) => {
  const action = new Action(req.body);
  try {
    const newAction = await action.save();
    res.status(201).json(newAction);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/goals", async (req, res) => {
  try {
    const goals = await Goal.find();
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/goals", async (req, res) => {
  const goal = new Goal(req.body);
  try {
    const newGoal = await goal.save();
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/goals/:goalId/details", async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    const views = await View.find({ visitor: goal.visitor });

    const actions = await Action.find({ visitor: goal.visitor });

    res.json({ goal, views, actions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


// Bon, ça a été un enfer ce tp, 
// et je sais même pas si ce que j'ai fait (merci internet pour ton aide + pensée pour chatGPT) est correct mais j'ai fait qqch.