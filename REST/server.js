const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const crypto = require("crypto");

const app = express();
const port = 8000;
const sql = postgres({
  db: "mydb",
  user: "user",
  password: "password",
  port: 1234,
});

app.use(express.json());

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${8000}`);
});

const CreateProductSchema = ProductSchema.omit({ id: true });

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

app.get("/products", async (req, res) => {
  try {
    let query = sql`SELECT * FROM products`;

    if (req.query.title) {
      query = sql`${query} WHERE name ILIKE '%' || ${req.query.title} || '%'`;
    }

    if (req.query.about) {
      if (req.query.title) {
        query = sql`${query} AND about ILIKE '%' || ${req.query.about} || '%'`;
      } else {
        query = sql`${query} WHERE about ILIKE '%' || ${req.query.about} || '%'`;
      }
    }

    if (req.query.price) {
      if (req.query.title || req.query.about) {
        query = sql`${query} AND price <= ${parseFloat(req.query.price)}`;
      } else {
        query = sql`${query} WHERE price <= ${parseFloat(req.query.price)}`;
      }
    }

    const products = await query;

    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
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

const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
});

const CreateUserSchema = UserSchema.omit({ id: true });

const hashPassword = (password) => {
  return crypto.createHash("sha512").update(password).digest("hex");
};

app.post("/users", async (req, res) => {
  const result = await CreateUserSchema.safeParse(req.body);

  if (result.success) {
    const { username, email, password } = result.data;
    const hashedPassword = hashPassword(password);

    const user = await sql`
      INSERT INTO users (username, email, password)
      VALUES (${username}, ${email}, ${hashedPassword})
      RETURNING *
    `;

    res.send(user[0]);
  } else {
    res.status(400).send(result);
  }
});

app.get("/users", async (req, res) => {
  const users = await sql`
    SELECT * FROM users
  `;

  res.send(users);
});

app.get("/users/:id", async (req, res) => {
  const user = await sql`
    SELECT * FROM users WHERE id=${req.params.id}
  `;

  if (user.length > 0) {
    res.send(user[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.put("/users/:id", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = hashPassword(password);

    await sql`
        UPDATE "user" SET username=${username}, email=${email}, password=${hashedPassword}
        WHERE id=${req.params.id}
        `;

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.patch("/users/:id", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (password) updateFields.password = hashPassword(password);

    await sql`
        UPDATE "user" SET ${sql(updateFields)} WHERE id=${req.params.id}
        `;

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/users/:id", async (req, res) => {
  const user = await sql`
    DELETE FROM users WHERE id=${req.params.id} RETURNING *
  `;

  if (user.length > 0) {
    res.send(user[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

import("node-fetch").then((fetch) => {
  app.get("/f2p-games", async (req, res) => {
    try {
      const response = await fetch.default(
        "https://www.freetogame.com/api/games"
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Free-to-Play games:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/f2p-games/:id", async (req, res) => {
    const gameId = req.params.id;
    try {
      const response = await fetch.default(
        `https://www.freetogame.com/api/game?id=${gameId}`
      );
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error(
        `Error fetching Free-to-Play game with ID ${gameId}:`,
        error
      );
      res.status(500).json({ error: "Internal server error" });
    }
  });
});

const OrderSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  total: z.number(),
  payment: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

app.post("/orders", async (req, res) => {
  const result = OrderSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({ error: "Invalid order data" });
    return;
  }

  const { userId, productId } = result.data;
  const product = await sql`SELECT * FROM products WHERE id = ${productId}`;

  if (product.length === 0) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const price = parseFloat(product[0].price);
  const total = price * 1.2;

  try {
    const order = await sql`
        INSERT INTO orders (userId, productId, total)
        VALUES (${userId}, ${productId}, ${total})
        RETURNING *
      `;

    res.json(order[0]);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const orders = await sql`SELECT * FROM orders`;
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/orders/:id", async (req, res) => {
  const orderId = req.params.id;
  try {
    const order = await sql`
        SELECT * FROM orders WHERE id=${orderId}
      `;

    if (order.length > 0) {
      const userId = order[0].userId;
      const productId = order[0].productId;

      const user = await sql`SELECT * FROM users WHERE id=${userId}`;
      const product = await sql`SELECT * FROM products WHERE id=${productId}`;

      if (user.length === 0 || product.length === 0) {
        res.status(404).json({ error: "User or product not found" });
      } else {
        res.json({ order: order[0], user: user[0], product: product[0] });
      }
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error(`Error fetching order with ID ${orderId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/orders/:id", async (req, res) => {
  const orderId = req.params.id;
  try {
    const deletedOrder = await sql`
        DELETE FROM orders WHERE id=${orderId} RETURNING *
      `;

    if (deletedOrder.length > 0) {
      res.json({
        message: "Order deleted successfully",
        order: deletedOrder[0],
      });
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error(`Error deleting order with ID ${orderId}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
});
