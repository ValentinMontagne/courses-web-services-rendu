// All other imports here.
const express = require('express');

const productRoutes = require("./routes/productRoutes");
// const userRoutes = require("./routes/userRoutes");

const app = express();
const port = 8000;


app.use(express.json());

// Product Schema + Product Route here.
// Routes racine
app.get("/", (req, res) => { res.send("bienvenue Dans mon api!"); });

// Routes pour les produits
app.use("/products", productRoutes);

// Init mongodb client connection
client.connect().then(() => {
    // Select db to use in mongodb
    db = client.db("myDB");
    app.listen(port, () => {
        console.log(`Listening on http://localhost:${port}`);
    });
});
