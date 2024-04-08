const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

// Middleware pour parser le corps des requêtes en JSON
app.use(express.json());

// Endpoint pour enregistrer une vue
app.post("/views", async (req, res) => {
    try {
        const view = req.body;
        const result = await db.collection("views").insertOne(view);
        res.status(201).json(result.ops[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement de la vue." });
    }
});

// Endpoint pour enregistrer une action
app.post("/actions", async (req, res) => {
    try {
        const action = req.body;
        const result = await db.collection("actions").insertOne(action);
        res.status(201).json(result.ops[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement de l'action." });
    }
});

// Endpoint pour enregistrer un goal
app.post("/goals", async (req, res) => {
    try {
        const goal = req.body;
        const result = await db.collection("goals").insertOne(goal);
        res.status(201).json(result.ops[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement du goal." });
    }
});

// Connexion à la base de données MongoDB
client.connect().then(() => {
    db = client.db("analyticsDB");
    // Démarrage du serveur
    app.listen(port, () => {
        console.log(`Serveur démarré sur http://localhost:${port}`);
    });
});
