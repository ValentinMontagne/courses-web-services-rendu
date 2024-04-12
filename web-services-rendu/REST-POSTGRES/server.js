const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const crypto = require("crypto");

const app = express();
const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password", port:"5435"});

app.use(express.json());

// Schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});
//schéma pour les utilisateurs en utilisant Zod

const UserSchema = z.object({
  username: z.string(),
  password: z.string(),
  email: z.string().email(),
});

// Function to hash password
const hashPassword = (password) => {
  return crypto.createHash('sha512').update(password).digest('hex');
}; 

const CreateProductSchema = ProductSchema.omit({ id: true });

	
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

  app.post("/users", async (req, res) => {
    const result = await UserSchema.safeParse(req.body);
  
    if (result.success) {
      const { username, password, email } = result.data;
      const hashedPassword = hashPassword(password);
  
    } else {
      res.status(400).send(result.error);
    }
  });

  app.put("/users/:username", async (req, res) => {
  });
  
  app.patch("/users/:username", async (req, res) => {
  });
  
  app.delete("/users/:username", async (req, res) => {
  });


app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
