const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const z = require("zod");

const app = express();
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
  
    // If Zod parsed successfully the request body
    if (result.success) {
      const { name } = result.data;
  
      const ack = await db.collection("categories").insertOne({ name });
  
      res.send({ _id: ack.insertedId, name });
    } else {
      res.status(400).send(result);
    }
  });

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
  })


  app.get("/categories", async (req, res) => {
    try {
      const categories = await db.collection("categories").find({}).toArray();
      res.send(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).send("Internal Server Error");
    }
  });

  app.get("/products/:id", async (req, res) => {
    const productId = req.params.id;
    try {
      const product = await db.collection("products").findOne({ _id: ObjectId(productId) });
      if (!product) {
        return res.status(404).send("Product not found");
      }
      res.send(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  // Route pour mettre à jour un produit
  app.put("/products/:id", async (req, res) => {
    const productId = req.params.id;
    const updates = req.body;
    try {
      const result = await db.collection("products").updateOne(
        { _id: ObjectId(productId) },
        { $set: updates }
      );
      if (result.modifiedCount === 0) {
        return res.status(404).send("Product not found");
      }
      res.send("Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  // Route pour supprimer un produit
  app.delete("/products/:id", async (req, res) => {
    const productId = req.params.id;
    try {
      const result = await db.collection("products").deleteOne({ _id: ObjectId(productId) });
      if (result.deletedCount === 0) {
        return res.status(404).send("Product not found");
      }
      res.send("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  // Route pour mettre à jour une catégorie
  app.put("/categories/:id", async (req, res) => {
    const categoryId = req.params.id;
    const updates = req.body;
    try {
      const result = await db.collection("categories").updateOne(
        { _id: ObjectId(categoryId) },
        { $set: updates }
      );
      if (result.modifiedCount === 0) {
        return res.status(404).send("Category not found");
      }
      res.send("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  
  // Route pour supprimer une catégorie
  app.delete("/categories/:id", async (req, res) => {
    const categoryId = req.params.id;
    try {
      const result = await db.collection("categories").deleteOne({ _id: ObjectId(categoryId) });
      if (result.deletedCount === 0) {
        return res.status(404).send("Category not found");
      }
      res.send("Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).send("Internal Server Error");
    }
  });