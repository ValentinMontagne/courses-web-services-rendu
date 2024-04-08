const { MongoClient, ObjectId } = require("mongodb");
const express = require("express");
const z = require("zod");

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

app.use(express.json());

// Product and Category Schema
	
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
  

// Init mongodb client connection
client.connect().then(() => {
  // Select db to use in mongodb
  db = client.db("myDB");
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
});

//Product Routes
app.post("/products", async (req, res) => {
    const result = await CreateProductSchema.safeParse(req.body);
  
    // If Zod parsed successfully the request body
    if (result.success) {
        const { name, about, price, categoryIds } = result.data;
        const categoryObjectIds = categoryIds.map((id) => new ObjectId(id));
  
        const ack = await db
        .collection("products")
        .insertOne({ name, about, price, categoryIds: categoryObjectIds });
  
        res.send({ _id: ack.insertedId, name, about, price, categoryIds: categoryObjectIds });
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
        const result = await db.collection("products").aggregate([
            { $match: { _id: new ObjectId(productId) } },
            {
                $lookup: {
                    from: "categories",
                    localField: "categoryIds",
                    foreignField: "_id",
                    as: "categories"
                }
            }
        ]).toArray();

        if (result.length === 0) {
            res.status(404).send({ error: "Product not found" });
            return;
        }

        res.send(result[0]);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

app.put("/products/:id", async (req, res) => {
  try {
      const productId = req.params.id;
      const result = await ProductSchema.safeParse(req.body);

      if (!result.success) {
          res.status(400).send({ error: "Invalid request body" });
          return;
      }

      const { name, about, price, categoryIds } = result.data;
      const categoryObjectIds = categoryIds.map(id => new ObjectId(id));

      await db.collection("products").updateOne(
          { _id: new ObjectId(productId) },
          { $set: { name, about, price, categoryIds: categoryObjectIds } }
      );

      const updatedProduct = await db.collection("products").findOne({ _id: new ObjectId(productId) });

      if (!updatedProduct) {
          res.status(404).send({ error: "Product not found" });
          return;
      }

      res.send(updatedProduct);
  } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).send({ error: "Internal server error" });
  }
});

app.delete("/products/:id", async (req, res) => {
    try {
        const productId = req.params.id;
        const deleteResult = await db.collection("products").deleteOne({ _id: new ObjectId(productId) });

        if (deleteResult.deletedCount === 0) {
            res.status(404).send({ error: "Product not found" });
            return;
        }

        res.send({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).send({ error: "Internal server error" });
    }
});

//Categorie routes
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
