// All other imports here.
const express = require("express");
const { MongoClient } = require("mongodb");
const z = require("zod");
const ObjectId = require("mongodb").ObjectId;

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
  categoryIds: z.array(z.string()),
});
const CreateProductSchema = ProductSchema.omit({ _id: true });
const PatchProductSchema = ProductSchema.omit({ _id: true }).partial({
  name: true,
  about: true,
  price: true,
  categoryIds: true,
});
const CategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
});
const CreateCategorySchema = CategorySchema.omit({ _id: true });

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

app.patch("/products/:id", async (req, res) => {
  const result = await PatchProductSchema.safeParse(req.body);

  // If Zod parsed successfully the request body
  if (result.success) {
    const { name, about, price, categoryIds } = result.data;

    updateDoc = {};
    if (name != undefined) {
      updateDoc = { ...updateDoc, name: name };
    }
    if (about != undefined) {
      updateDoc = { ...updateDoc, about: about };
    }
    if (price != undefined) {
      updateDoc = { ...updateDoc, price: price };
    }
    if (categoryIds != undefined) {
      const categoryObjectIds = categoryIds.map((id) => new ObjectId(id));
      updateDoc = { ...updateDoc, categoryIds: categoryObjectIds };
    }

    const ack = await db
      .collection("products")
      .findOneAndUpdate(
        { _id: new ObjectId(req.params.id) },
        { $set: updateDoc },
        { upsert: false, returnDocument: true }
      );

    res.send({
      _id: ack._id,
      name: ack.name,
      about: ack.about,
      price: ack.price,
      categoryIds: ack.categoryIds,
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
  var result = [];
  if (ObjectId.isValid(req.params.id)) {
    result = await db
      .collection("products")
      .aggregate([
        {
          $match: {
            _id: new ObjectId(req.params.id),
          },
        },
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
  }
  if (result.length > 0) {
    res.send(result[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.delete("/products/:id", async (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    var result = await db
      .collection("products")
      .findOneAndDelete({ _id: new ObjectId(req.params.id) });
  }
  if (result != undefined) {
    res.send(result);
  } else {
    res.status(404).send({ message: "Not found" });
  }
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
