const express = require("express");
const app = express();
const port = 8000;
const postgres = require("postgres");
const z = require("zod");
const bcrypt = require("bcrypt");

const sql = postgres({ db: "mydb", user: "user", password: "password" });

app.use(express.json());

// Schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});
const CreateProductSchema = ProductSchema.omit({ id: true });

const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  password: z.string(),
});
const CreateUserSchema = UserSchema.omit({ id: true });
const PatchUserSchema = CreateUserSchema.partial({
  username: true,
  email: true,
  password: true,
});

const OrderSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  product_id: z.string(),
  total_price: z.number().positive(),
  created_at: z.string(),
  payment_method: z.string(),
  updated_at: z.string(),
});
const CreateOrderSchema = OrderSchema.omit({ id: true });

app.post("/products", async (req, res) => {
  const result = await CreateProductSchema.safeParse(req.body);

  // If Zod parsed successfully the request body
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
    const { name, about, price } = req.query;
    const setNameFilter = (name) => sql` AND name LIKE ${"%" + name + "%"}`;
    const setAboutFilter = (about) => sql` AND about LIKE ${"%" + about + "%"}`;
    const setPriceFilter = (price) => sql` AND price = ${price}`;
    const products = await sql`
      SELECT * FROM products
      WHERE 1=1 ${name ? setNameFilter(name) : sql``}
      ${about ? setAboutFilter(about) : sql``}
      ${price ? setPriceFilter(price) : sql``}
      `;
    res.send(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Unable to fetch products" });
  }
});

app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await sql`SELECT * FROM products WHERE id = ${id}`;

  if (product.length === 0) {
    res.status(404).send({ message: "Product not found" });
  } else {
    res.send(product[0]);
  }
});

app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const result = await ProductSchema.safeParse(req.body);

  if (result.success) {
    const { name, about, price } = result.data;

    const product = await sql`
      UPDATE products
      SET name = ${name}, about = ${about}, price = ${price}
      WHERE id = ${id}
      RETURNING *
      `;

    if (product.length === 0) {
      res.status(404).send({ message: "Product not found" });
    } else {
      res.send(product[0]);
    }
  } else {
    res.status(400).send(result);
  }
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await sql`
    DELETE FROM products
    WHERE id = ${id}
    RETURNING *
    `;

  if (product.length === 0) {
    res.status(404).send({ message: "Product not found" });
  } else {
    res.send(product[0]);
  }
});

app.get("/users", async (req, res) => {
  const users = await sql`SELECT * FROM users`;
  for (let user of users) {
    delete user.password;
  }
  res.send(users);
});

app.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await sql`SELECT * FROM users WHERE id = ${id}`;

  if (user.length === 0) {
    res.status(404).send({ message: "User not found" });
  } else {
    delete user[0].password;
    res.send(user[0]);
  }
});

app.post("/users", async (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);

  // If Zod parsed successfully the request body
  if (result.success) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await sql`
    INSERT INTO users (username, email, password) 
    VALUES (${req.body.username}, ${req.body.email}, ${hashedPassword})
    RETURNING *
    `;
    delete user[0].password;

    res.send(user[0]);
  } else {
    res.status(400).send(result);
  }
});

app.put("/users/:id", async (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);

  if (result.success) {
    const { id } = req.params;
    const user = await sql`
      UPDATE users
      SET username = ${req.body.username}, email = ${req.body.email}
      WHERE id = ${id}
      RETURNING *
      `;

    if (user.length === 0) {
      res.status(404).send({ message: "User not found" });
    } else {
      res.send(user[0]);
    }
  } else {
    res.status(400).send(result);
  }
});

app.patch("/users/:id", async (req, res) => {
  const result = PatchUserSchema.safeParse(req.body);

  if (result.success) {
    const { id } = req.params;
    const scriptSql = Object.keys(result.data).map(
      (key) => sql`${key} = ${result.data[key]}`
    )[0];
    console.log(scriptSql);
    const user = await sql`
      UPDATE users
      SET ${scriptSql}
      WHERE id = ${id}
      RETURNING *
      `;

    if (user.length === 0) {
      res.status(404).send({ message: "User not found" });
    } else {
      res.send(user[0]);
    }
  } else {
    res.status(400).send(result);
  }
});

app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  const user = await sql`
    DELETE FROM users
    WHERE id = ${id}
    RETURNING *
    `;

  if (user.length === 0) {
    res.status(404).send({ message: "User not found" });
  } else {
    res.send(user[0]);
  }
});

app.get("/f2p-games", async (req, res) => {
  import("node-fetch").then((fetch) => {
    fetch.default("https://www.freetogame.com/api/games");
  });
  const response = await fetch("https://www.freetogame.com/api/games");
  const data = await response.json();
  res.json(data);
});

app.get("/f2p-games/:id", async (req, res) => {
  const { id } = req.params;
  import("node-fetch").then((fetch) => {
    fetch.default(`https://www.freetogame.com/api/game?id=${id}`);
  });
  const response = await fetch(`https://www.freetogame.com/api/game?id=${id}`);
  const data = await response.json();
  res.json(data);
});

app.get("/orders",  async (req, res) => {
  const orders = await sql`SELECT * FROM orders`;
  const userId = await sql`SELECT * FROM users WHERE id = ${orders[0].user_id}`;
  for (let order of orders) {
    delete userId[0].password;
    order.user = userId[0];
  }
  res.send(orders);

});

app.get("/orders/:id", async (req, res) => {
  const { id } = req.params;
  const order = await sql`SELECT * FROM orders WHERE id = ${id}`;

  if (order.length === 0) {
    res.status(404).send({ message: "Order not found" });
  } else {
    res.send(order[0]);
  }
});

app.post("/orders", async (req, res) => {
  const result = CreateOrderSchema.safeParse(req.body);

  if (result.success) {
    const { user_id, product_id, total_price, payment_method } = result.data;

    const order = await sql`
      INSERT INTO orders (user_id, product_id, total_price, payment_method, created_at, updated_at)
      VALUES (${user_id}, ${product_id}, ${total_price}, ${payment_method}, NOW(), NOW())
      RETURNING *
      `;

    res.send(order[0]);
  } else {
    res.status(400).send(result);
  }
});

app.delete("/orders/:id", async (req, res) => {
  const { id } = req.params;
  const order = await sql`
    DELETE FROM orders
    WHERE id = ${id}
    RETURNING *
    `;

  if (order.length === 0) {
    res.status(404).send({ message: "Order not found" });
  } else {
    res.send(order[0]);
  }
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

app.use(express.json());
