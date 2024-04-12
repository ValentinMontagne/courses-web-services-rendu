const express = require("express");
const postgres = require("postgres");
const crypto = require("crypto");
const z = require("zod");
const fetch = require("node-fetch");

const app = express();
const port = 8000;
const sql = postgres({
  db: "mydb",
  user: "user",
  password: "password",
  port: "5433",
});

// Schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});
const CreateProductSchema = ProductSchema.omit({ id: true });

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

// REQUETES PRODUCTS
//POST
app.post("/products", async (req, res) => {
  const result = await CreateProductSchema.safeParse(req.body);
  if (result.success) {
    const { name, about, price } = result.data;

    const product = await sql`
      INSERT INTO products (name, about, price)
      VALUES (${name}, ${about}, ${price})
      RETURNING *
      `;

    res.send(product[0]);
  } else {
    res.status(400).send(result);
  }
});

// GET
app.get("/products", async (req, res) => {
  const products = await sql`
      SELECT * FROM products
      `;

  res.send(products);
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

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
