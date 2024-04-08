const express = require("express");
const { MongoClient } = require("mongodb");
const productRoutes = require("./routes/productRoutes");
const categorieRoutes = require("./routes/categorieRoutes");

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

app.use(express.json());

/* INIT CONNECTION */
client.connect().then(() => {
    // Select db to use in mongodb
    db = client.db("myDB");

    // Pass MongoDB connection to routes
    app.use("/products", productRoutes(db));
    app.use("/categories", categorieRoutes(db));

    app.listen(port, () => {
      console.log(`Listening on http://localhost:${port}`);
    });
  });
