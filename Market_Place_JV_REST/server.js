const express = require("express");
const postgres = require("postgres");
const z = require("zod");

const app = express();
const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password" });

app.use(express.json());

// Schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  password: z.string(),
})

const CreateUserSchema = UserSchema.omit({ id: true });
const CreateProductSchema = ProductSchema.omit({ id: true });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

app.get("/products/:id", async (req, res) => {
    const productId = req.params.id;

    try {
      const product = await sql`
        SELECT * FROM products
        WHERE id = ${productId}
      `;
  
      if (product.length == 0) {
        res.status(404).json({ error: "Product not found" });
      } else {
        res.json(product[0]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
})

app.get("/products", async (req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      const product = await sql`
        SELECT * FROM products
        ORDER BY id
        LIMIT ${limit} OFFSET ${offset}
      `;
  
      if (product.length == 0) {
        res.status(404).json({ error: "Products not found" });
      } else {
        res.json(product);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
})

app.post("/products", async (req, res) => {

  const result = await CreateProductSchema.safeParse(req.body);

  if (result.success) {
    const { name, about, price } = result.data;

    try {
      const product = await sql`
      INSERT INTO products (name, about, price)
      VALUES (${name}, ${about}, ${price})
      RETURNING * `;
  
      if (product.length == 0) {
        res.status(404).json({ error: "Error creating new product" });
      } else {
        res.json(product);
      }
  
    } catch (error) {
      console.error("Error creating new product:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
})

app.delete("/products/:id", async (req, res) => {
  const product = await sql`
    DELETE FROM products
    WHERE id=${req.params.id}
    RETURNING *
    `;
 
  if (product.length > 0) {
    res.send(product);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.post("/users", async (req, res) => {

  const result = await CreateUserSchema.safeParse(req.body);

  if (result.success) {
    const { name, email, password } = result.data;

    try {
      const user = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${password})
      RETURNING name, email `;
  
      if (user.length == 0) {
        res.status(404).json({ error: "Error creating new user" });
      } else {
        res.json(user);
      }
  
    } catch (error) {
      console.error("Error creating new user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

app.get("/users", async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const product = await sql`
      SELECT name, email FROM users
      ORDER BY id
      LIMIT ${limit} OFFSET ${offset}
    `;

    if (product.length == 0) {
      res.status(404).json({ error: "Users not found" });
    } else {
      res.json(product);
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
