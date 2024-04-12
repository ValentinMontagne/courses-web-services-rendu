const express = require("express");
const z = require("zod");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const port = 8000;
const client = new MongoClient("mongodb://localhost:27017");
let db;

app.use(express.json());

// Schemas
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

const UserSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
});
const CreateUserSchema = UserSchema.omit({ id: true });
const UpdateUserSchema = UserSchema.partial();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Bonjour à tous !");
});

// const insertResult = await collection.insertMany([
//   { a: 1 },
//   { a: 2 },
//   { a: 3 },
// ]);
// console.log("Inserted documents =>", insertResult);

// const findResult = await collection.find({}).toArray();
// console.log("Found documents =>", findResult);

// const filteredDocs = await collection.find({ a: 3 }).toArray();
// console.log("Found documents filtered by { a: 3 } =>", filteredDocs);

// const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
// console.log("Updated documents =>", updateResult);

// const deleteResult = await collection.deleteMany({ a: 3 });
// console.log("Deleted documents =>", deleteResult);

// const indexName = await collection.createIndex({ a: 1 });
// console.log("index name =", indexName);

// REQUETES PRODUCTS
//POST
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

// GET
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
  const product = await sql`
      SELECT * FROM products WHERE id=${req.params.id}
      `;

  if (product.length > 0) {
    res.send(product[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

// DELETE
app.delete("/products/:id", async (req, res) => {
  const product = await sql`
      DELETE FROM products
      WHERE id=${req.params.id}
      RETURNING *
      `;

  if (product.length > 0) {
    res.send(product[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

// REQUETES USERS
// POST
app.post("/users", async (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error);
  }

  const { username, password, email } = result.data;
  const hashedPassword = crypto
    .createHash("sha512")
    .update(password)
    .digest("hex");

  try {
    const user = await sql`
        INSERT INTO users (username, password, email)
        VALUES (${username}, ${hashedPassword}, ${email})
        RETURNING id, username, email
      `;
    res.status(201).send(user[0]);
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error creating user", error: error.message });
  }
});

// GET
app.get("/users", async (req, res) => {
  const users = await sql`SELECT id, username, email FROM users`;
  res.send(users);
});

app.get("/users/:id", async (req, res) => {
  try {
    const user = await sql`
        SELECT id, username, email FROM users WHERE id = ${req.params.id}
      `;

    if (user.length > 0) {
      res.send(user[0]);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error retrieving user", error: error.message });
  }
});

// DELETE
app.delete("/users/:id", async (req, res) => {
  const user = await sql`
      DELETE FROM users
      WHERE id = ${req.params.id}
      RETURNING id, username, email
    `;

  if (user.length > 0) {
    res.send(user[0]);
  } else {
    res.status(404).send({ message: "User not found" });
  }
});

app.put("/users/:id", async (req, res) => {
  const result = UpdateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).send(result.error);
  }

  const { username, password, email } = result.data;
  const hashedPassword = password
    ? crypto.createHash("sha512").update(password).digest("hex")
    : undefined;

  try {
    const user = await sql`
        UPDATE users
        SET 
          username = ${username}, 
          password = ${hashedPassword}, 
          email = ${email}
        WHERE id = ${req.params.id}
        RETURNING id, username, email
      `;
    if (user.length > 0) {
      res.send(user[0]);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error updating user", error: error.message });
  }
});

app.patch("/users/:id", async (req, res) => {
  const { username, password, email } = req.body;
  let updates = [];
  if (username) updates.push(`username = '${username}'`);
  if (email) updates.push(`email = '${email}'`);
  if (password) {
    const hashedPassword = crypto
      .createHash("sha512")
      .update(password)
      .digest("hex");
    updates.push(`password = '${hashedPassword}'`);
  }

  if (updates.length === 0) {
    return res.status(400).send({ message: "No updates provided" });
  }

  try {
    const query = `
        UPDATE users
        SET ${updates.join(", ")}
        WHERE id = ${req.params.id}
        RETURNING id, username, email
      `;
    const user = await sql.unsafe(query);

    if (user.length > 0) {
      res.send(user[0]);
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    res
      .status(500)
      .send({ message: "Error updating user", error: error.message });
  }
});

// Recuperer tous les jeux
app.get("/f2p-games", async (req, res) => {
  try {
    const response = await fetch("https://www.freetogame.com/api/games");
    const data = await response.json();
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: "Erreur lors de la récupération des jeux",
      error: error.message,
    });
  }
});

// Récuperer un jeu par son ID
app.get("/f2p-games/:id", async (req, res) => {
  try {
    const response = await fetch(
      `https://www.freetogame.com/api/game?id=${req.params.id}`
    );
    const data = await response.json();
    if (data) {
      res.send(data);
    } else {
      res.status(404).send({ message: "Jeu non trouvé" });
    }
  } catch (error) {
    res.status(500).send({
      message: "Erreur lors de la récupération du jeu",
      error: error.message,
    });
  }
});

// Tous les jeux de tir
app.get("/f2p-games?shooter", async (req, res) => {
  try {
    const response = await fetch(
      "https://www.freetogame.com/api/games?shooter"
    );
    const data = await response.json();
    res.send(data);
  } catch (error) {
    res.status(500).send({
      message: "Erreur lors de la récupération des jeux",
      error: error.message,
    });
  }
});

// POST categrories
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

// GET Categories
app.get("/categories", async (req, res) => {
  try {
    const categories = await db.collection("categories").find({}).toArray();
    res.send(categories);
  } catch (error) {
    res.status(500).send({
      message: "Erreur lors de la récupération des catégories",
      error: error.message,
    });
  }
});

client.connect().then(() => {
  // Select db to use in mongodb
  db = client.db("myDB");
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
});
