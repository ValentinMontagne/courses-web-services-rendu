const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const z = require("zod");

const app = express();

const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

app.use(express.json());

client.connect().then(() => {
    // Select db to use in mongodb
    db = client.db("myDB");
    app.listen(port, () => {
        console.log(`Listening on http://localhost:${port}`);
    });
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

// Insert a Document
// Add to app.js the following function which uses the insertMany method to add three documents to the documents collection.

/*const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
console.log('Inserted documents =>', insertResult);
// The insertMany command returns an object with information about the insert operations.

// Find All Documents
// Add a query that returns all the documents.

const findResult = await collection.find({}).toArray();
console.log('Found documents =>', findResult);
// This query returns all the documents in the documents collection. If you add this below the insertMany example you'll see the document's you've inserted.

// Find Documents with a Query Filter
// Add a query filter to find only documents which meet the query criteria.

const filteredDocs = await collection.find({ a: 3 }).toArray();
console.log('Found documents filtered by { a: 3 } =>', filteredDocs);
// Only the documents which match 'a' : 3 should be returned.

// Update a document
// The following operation updates a document in the documents collection.

const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
console.log('Updated documents =>', updateResult);
// The method updates the first document where the field a is equal to 3 by adding a new field b to the document set to 1. updateResult contains information about whether there was a matching document to update or not.

// Remove a document
// Remove the document where the field a is equal to 3.

const deleteResult = await collection.deleteMany({ a: 3 });
console.log('Deleted documents =>', deleteResult);

// Index a Collection
// Indexes can improve your application's performance. The following function creates an index on the a field in the documents collection.

const indexName = await collection.createIndex({ a: 1 });
console.log('index name =', indexName);
*/
// Full documentation : https://www.mongodb.com/docs/drivers/node/current/

app.post("/products", async (req, res) => {
    const result = await CreateProductSchema.safeParse(req.body);

    // If Zod parsed successfully the request body
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

app.put('/products/:productId', async (req, res) => {
    const productId = req.params.productId;
    const update = req.body; // Données à mettre à jour

    try {
        const updatedProduct = await db.collection("products").findOneAndUpdate(
            { _id: ObjectId(productId) },
            { $set: update },
            { returnOriginal: false }
        );

        if (updatedProduct.value) {
            res.json(updatedProduct.value);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/products/:productId', async (req, res) => {
    const productId = req.params.productId;

    try {
        const deletedProduct = await db.collection("products").findOneAndDelete(
            { _id: ObjectId(productId) }
        );

        if (deletedProduct.value) {
            res.json(deletedProduct.value);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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