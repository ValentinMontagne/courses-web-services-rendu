const { MongoClient } = require("mongodb");
const express = require("express");
const z = require("zod");
const app = express();
const port = 8888;
const client = new MongoClient("mongodb://localhost:27017");
const server = createServer(app);
let db;

app.use(express.json());

client.connect().then(() => {
    db = client.db("myDB");
    app.listen(port, () => {
        console.log(`Listening on http://localhost:${port}`);
    });
});

app.get("/", (req, res) => {
    res.send("TEST");
});

app.post("/products", async (req, res) => {
    const result = await CreateProductSchema.safeParse(req.body);

    if (result.success) {
        const { name, about, price, categoryIds } = result.data;
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

// Schemas
const ProductSchema = z.object({
    _id: z.string(),
    name: z.string(),
    about: z.string(),
    price: z.number().positive(),
    categoryIds: z.array(z.string())
});
const CreateProductSchema = ProductSchema.omit({ _id: true });
const CategorySchema = z.object({
    _id: z.string(),
    name: z.string(),
});
const CreateCategorySchema = CategorySchema.omit({ _id: true });

app.post("/categories", async (req, res) => {
    const result = await CreateCategorySchema.safeParse(req.body);
    if (result.success) {
        const { name } = result.data;

        const ack = await db.collection("categories").insertOne({ name });

        res.send({ _id: ack.insertedId, name });
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