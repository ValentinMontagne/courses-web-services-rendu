/* IMPORTS */
const express = require("express");
const z = require("zod");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

app.use(express.json());


/* SCHEMAS */
const ProductSchema = z.object({
  _id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
  categoryIds: z.array(z.string()),
});
const CreateProductSchema = ProductSchema.omit({ _id: true });
const CategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
});
const CreateCategorySchema = CategorySchema.omit({ _id: true });

/* PRODUCTS */
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

app.get("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await db
      .collection("products")
      .findOne({ _id: new ObjectId(productId) }); // Utilisation de 'new' pour créer un nouvel ObjectId
    if (!product) {
      res.status(404).send("Product not found");
      return;
    }
    res.send(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.put("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const productData = req.body;
    const { name, about, price, categoryIds } = productData;

    // Vérifiez si l'ID du produit est valide
    if (!ObjectId.isValid(productId)) {
      res.status(400).send("Invalid product ID");
      return;
    }

    // Vérifiez si le produit existe avant de le mettre à jour
    const existingProduct = await db.collection("products").findOne({ _id: new ObjectId(productId) });
    if (!existingProduct) {
      res.status(404).send("Product not found");
      return;
    }

    // Mettre à jour le produit avec les nouvelles données
    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(productId) },
      { $set: { name, about, price, categoryIds } }
    );

    if (result.modifiedCount === 0) {
      res.status(500).send("Failed to update product");
      return;
    }

    res.send("Product updated successfully");
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Internal Server Error");
  }
});


app.delete("/products/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(productId) }); // Utilisation de 'new' pour créer un nouvel ObjectId
    if (result.deletedCount === 0) {
      res.status(404).send("Product not found");
      return;
    }
    res.send("Product deleted successfully");
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Internal Server Error");
  }
});

/* CATEGORIES */
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

/* INIT CONNECTION */
client.connect().then(() => {
  // Select db to use in mongodb
  db = client.db("myDB");
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
});
