const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const z = require("zod"); // Importer la bibliothèque zod

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

// Schemas
const ProductSchema = z.object({
    name: z.string(),
    about: z.string(),
    price: z.number().positive(),
    categoryIds: z.array(z.string())
});
const CreateProductSchema = ProductSchema.omit({ _id: true });
const CategorySchema = z.object({
    name: z.string(),
});
const CreateCategorySchema = CategorySchema.omit({ _id: true });

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Bienvenue sur le serveur principal !");
});

// Product Schema + Product Route here.
app.post("/products", async (req, res) => {
    const result = await CreateProductSchema.safeParse(req.body);

    // If Zod parsed successfully the request body
    if (result.success) {
        const { name, about, price, categoryIds } = result.data;
        // Générer des identifiants de catégorie valides
        const categoryObjectIds = categoryIds.map((id) => new ObjectId(id));

        const ack = await db
            .collection("products")
            .insertOne({ name, about, price, categoryIds: categoryObjectIds });

        res.send({
            _id: ack.insertedId,
            name,
            about,
            price,
            categoryIds: categoryObjectIds,
        });
    } else {
        res.status(400).send(result);
    }
});

app.get("/products", async (req, res) => {
    const result = await db
        .collection("products")
        .aggregate([
            { $match: {} },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryIds",
                    foreignField: "_id",
                    as: "categories",
                },
            },
        ])
        .toArray();

    res.send(result);
});

app.post("/categories", async (req, res) => {
    const result = await CreateCategorySchema.safeParse(req.body);

    // If Zod parsed successfully the request body
    if (result.success) {
        const { name } = result.data;

        const ack = await db.collection("categories").insertOne({ name });

        res.send({ _id: ack.insertedId, name });
    } else {
        res.status(400).send(result);
    }
});

// Init mongodb client connection
client.connect().then(() => {
    // Select db to use in mongodb
    db = client.db("myDB");
    app.listen(port, () => {
        console.log(`Listening on http://localhost:${port}`);
    });
});
