	
const { MongoClient } = require("mongodb");
 const express  = require('express');
const app = express();
const {z} = require('zod');
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

	
app.post("/products", async (req, res) => {
    const result = await CreateProductSchema.safeParse(req.body);
   
    // If Zod parsed successfully the request body
    if (result.success) {
      const { name, about, price } = result.data;
   
      const ack = await db
        .collection("products")
        .insertOne({ name, about, price });
   
      res.send({ _id: ack.insertedId, name, about, price });
    } else {
      res.status(400).send(result);
    }
  });