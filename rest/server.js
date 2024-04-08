
const express = require("express");
const app = express();
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Routes racine
app.get("/", (req, res) => { res.send("bienvenue Dans mon api!"); });

// Routes pour les produits
app.use("/products", productRoutes);

// Routes pour les users
app.use("/users", userRoutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
