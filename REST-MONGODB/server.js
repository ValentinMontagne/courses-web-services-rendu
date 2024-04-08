// All other imports here.
const { MongoClient } = require("mongodb");
const z = require("zod");
const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

app.use(express.json());

// Product Schema + Product Route here.

// Schemas
const ProductSchema = z.object({
  _id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
  categoryIds: z.array(z.string()),
});
const PatchProductSchema = ProductSchema.partial({
  name: true,
  about: true,
  price: true,
  categoryIds: true
}).omit({ _id: true });

const CreateProductSchemaa = ProductSchema.omit({ _id: true });
const PutProductSchema = ProductSchema;

const CreateProductSchema = ProductSchema.omit({ _id: true });

const CategorySchema = z.object({
  _id: z.string(),
  name: z.string(),
});
const CreateCategorySchema = CategorySchema.omit({ _id: true });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Init mongodb client connection
client.connect().then(() => {
  // Select db to use in mongodb
  db = client.db("myDB");

  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
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
  });

  app.get("/products/:id", async (req, res) => {
    let idToFind = req.params.id;
    try {
      let o_id = new ObjectId(idToFind);
      const result = await db
        .collection("products")
        .aggregate([
          { $match: { _id: o_id } },
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
      if (result.length == 0) {
        res.status(404).send("Product not found");
      }
      res.send(result[0]);
    } catch (e) {
      res.status(400).send("Error with id : " + e);
    }
  });

  app.delete("/products/:id", async (req, res) => {
    let idToFind = req.params.id;
    try {
      var o_id = new ObjectId(idToFind);
      const result = await db.collection("products").deleteMany({ _id: o_id });
      res.send(result);
    } catch (e) {
      res.status(400).send("Error with id");
    }
  });


  app.patch("/products/:id", async (req, res) => {
    let id = req.params.id;
    const result = PatchProductSchema.safeParse(req.body);

    // If Zod parsed successfully the request body
    if (result.success) {
      console.log(result.data)
      const resultTemp = result.data;
      const { name, about, price, categoryIds } = result.data;
      try {
        const o_id = new ObjectId(id);
        const result = await db
          .collection("products")
          .aggregate([
            { $match: { _id: o_id } },
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
        console.log(result)
        if (result.length == 0) {
          res.status(404).send("Product not found");
        } else {
          const updateResult = await db
            .collection("products")
            .updateOne({_id:o_id}, { $set: resultTemp });
          console.log("azd")
          console.log("Updated documents =>", updateResult);
          res.send(updateResult)
        }
      } catch (e) {
        res.status(400).send("Error with id : " + e);
      }
    } else {
      res.status(400).send(result);
    }
  });

  app.put("/products", async function (req, res) {
    const result = PutUserSChema.safeParse(req.body);
    if (result.success) {
      const { id, nom, email, password } = result.data;
      const user = await sql`
          SELECT * FROM users WHERE id=${id}
          `;
      if (user.length > 0) {
        //Update value from user if is defined
        let userPut = user[0];
        userPut.nom = nom ? nom : userPut.nom;
        userPut.email = email ? email : userPut.email;
        userPut.password = password
          ? hash_password(password)
          : userPut.password;
        await sql`
              UPDATE users
              SET nom = ${userPut.nom},email = ${userPut.email},password = ${userPut.password} 
              WHERE id = ${id}`;
        res.send(userPut);
      } else {
        //Create new user if not exist
        res.status(404).send({ message: "Not found" });
      }
    } else {
      res.status(400).send(result);
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
});
