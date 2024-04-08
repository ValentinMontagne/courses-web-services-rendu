// All other imports here.
const { MongoClient,ObjectId } = require("mongodb");
const express = require("express");
const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
const zod = require("zod");
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
const ProductSchema = zod.object({
  _id: zod.string(),
  name: zod.string(),
  about: zod.string(),
  price: zod.number().positive(),
  categoryIds: zod.array(zod.string())
});

const CreateProductSchema = ProductSchema.omit({ _id: true });

const CategorySchema = zod.object({
  _id: zod.string(),
  name: zod.string(),
});
const CreateCategorySchema = CategorySchema.omit({ _id: true });

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
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

app.delete("/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    // Exécuter une requête SQL DELETE pour supprimer le produit de la base de données
    const result = await sql`DELETE FROM products WHERE id = ${productId}`;

    // Vérifier si le produit a été supprimé avec succès
    if (result.rowCount === 0) {
      // Si aucun produit correspondant n'a été trouvé, renvoyer un message d'erreur
      res.status(404).json({ success: false, error: "Product not found" });
    } else {
      // Si le produit a été supprimé avec succès, renvoyer une réponse de succès
      res
        .status(200)
        .json({ success: true, message: "Product deleted successfully" });
    }
  } catch (error) {
    // En cas d'erreur lors de la suppression du produit, renvoyer un message d'erreur
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

app.delete("/products/delete/all", async (req, res) => {
  try {
    const result = await sql`DELETE FROM products`;

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, error: "Produit introuvable" });
    } else {
      res.status(200).json({
        success: true,
        message: "Tout les produits sont supprimés  ",
      });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de tout les produit");
    res.status(500).json({ succes: false, error: "Internal server error" });
  }
});

app.get("/products/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    // Exécuter une requête SQL DELETE pour supprimer le produit de la base de données
    const result = await sql`SELECT FROM products WHERE id = ${productId}`;

    // Vérifier si le produit a été supprimé avec succès
    if (result.rowCount === 0) {
      // Si aucun produit correspondant n'a été trouvé, renvoyer un message d'erreur
      res.status(404).json({ success: false, error: "Product not found" });
    } else {
      // Si le produit a été supprimé avec succès, renvoyer une réponse de succès
      res.status(200).json({
        success: true,
        message: "Voici le produit numéro ",
        productID,
      });
    }
  } catch (error) {
    // En cas d'erreur lors de la suppression du produit, renvoyer un message d'erreur
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});
// Schemas
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
