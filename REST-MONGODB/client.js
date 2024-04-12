
// All other imports here.
const { MongoClient } = require("mongodb");
const z = require("zod");
const express = require("express");

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

app.use(express.json());


// Init mongodb
client.connect().then(() => {
  db = client.db("myDB");
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
    });
});

const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    about: z.string(),
    price: z.number().positive(),
});
const CreateProductSchema = ProductSchema.omit({ id: true });


app.post("/products", async (req, res) => {
    const result = await CreateProductSchema.safeParse(req.body);

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

  