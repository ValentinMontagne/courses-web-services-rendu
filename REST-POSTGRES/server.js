const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const crypto = require("crypto");

const app = express();
const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password", port: 1234 });

app.use(express.json());

// Schemas
const ProductSchema = z.object({
    id: z.number(),
    name: z.string(),
    about: z.string(),
    price: z.number().positive(),
});

const UserSchema = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
});

// Products routes
app.get("/products/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        const product = await sql`
            SELECT * FROM products
            WHERE id = ${productId}
        `;

        if (product.length === 0) {
            return res.status(404).json({ error: "Product not found" });
        }

        const parsedProduct = ProductSchema.parse(product[0]);

        res.json(parsedProduct);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/products", async (req, res) => {
    try {
        const products = await sql`
            SELECT * FROM products
        `;

        if (products.length === 0) {
            return res.status(404).json({ error: "No products found" });
        }

        const parsedProducts = products.map((product) => ProductSchema.parse(product));

        res.json(parsedProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/products", async (req, res) => {
    try {
        const { name, about, price } = req.body;

        const newProduct = await sql`
            INSERT INTO products (name, about, price)
            VALUES (${name}, ${about}, ${price})
            RETURNING id, name, about, price
        `;

        const parsedProduct = ProductSchema.parse(newProduct[0]);

        res.json(parsedProduct);
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ error: "Internal server error" });
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

// Users routes
app.post("/users", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Hash the password
        const hashedPassword = crypto.createHash("sha512").update(password).digest("hex");

        // Insert the user into the database
        const newUser = await sql`
            INSERT INTO users (username, email, password)
            VALUES (${username}, ${email}, ${hashedPassword})
            RETURNING id, username, email
        `;

        res.status(201).json(newUser[0]);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Users routes
app.get("/users", async (req, res) => {
    try {
        const users = await sql`
            SELECT id, username, email FROM users
        `;

        if (users.length === 0) {
            return res.status(404).json({ error: "No users found" });
        }

        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Get user by ID
app.get("/users/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        // Requête SQL pour récupérer les détails de l'utilisateur par son ID
        const user = await sql`
            SELECT id, username, email FROM users
            WHERE id = ${userId}
        `;

        // Vérifier si l'utilisateur existe
        if (user.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        // Renvoyer les détails de l'utilisateur
        res.json(user[0]);
    } catch (error) {
        // Gérer les erreurs en renvoyant une réponse 500 (Internal Server Error)
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Update a user
app.put("/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
      const { username, email, password } = req.body;
  
      const updatedUser = await sql`
        UPDATE users
        SET username = ${username}, email = ${email}, password = ${password}
        WHERE id = ${userId}
        RETURNING id, username, email
      `;
  
      if (updatedUser.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(updatedUser[0]);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Patch a user
app.patch("/users/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: "Username is required" });
        }

        const updatedUser = await sql`
            UPDATE users
            SET username = ${username}
            WHERE id = ${userId}
            RETURNING id, username, email
        `;

        if (updatedUser.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(updatedUser[0]);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


  // Delete a user
app.delete("/users/:id", async (req, res) => {
    try {
      const userId = req.params.id;
  
      // Supprimer l'utilisateur de la base de données en utilisant son ID
      const deletedUser = await sql`
        DELETE FROM users
        WHERE id = ${userId}
        RETURNING id, username, email
      `;
  
      // Vérifier si l'utilisateur a été supprimé avec succès
      if (deletedUser.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      // Renvoyer les informations sur l'utilisateur supprimé
      res.json(deletedUser[0]);
    } catch (error) {
      // Gérer les erreurs en renvoyant une réponse 500 (Internal Server Error)
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/products?title=:title", async (req, res) => {
    const product = await sql`SELECT * FROM products WHERE name LIKE '%' || ${req.params.title} || '%'`;
    if (product.length > 0) {
        res.send(product[0]);
    } else {
        res.status(404).send({ message: "Not found" });
    }
});

app.get("/f2p-games", async (req, res) => {
    const response = await fetch('https://www.freetogame.com/api/games');
    const data = await response.json();

    if (data) {
        res.send(data);
    } else {
        res.status(404).send({ message: "Not found" });
    }
});

app.get("/f2p-games/:id", async (req, res) => {
    const response = await fetch(`https://www.freetogame.com/api/game?id=${req.params.id}`);
    const data = await response.json();

    if (data) {
        res.send(data);
    } else {
        res.status(404).send({ message: "Not found" });
    }
});

app.post("/orders", async (req, res) => {
    const result = await CreateProductSchema.safeParse(req.body);

    // If Zod parsed successfully the request body
    if (result.success) {
        const { userId, productId } = result.data;

        const product = await sql`SELECT * FROM products WHERE id=${productId}`;

        const total = product[0].price * 1.2;
        const user = await sql`
            SELECT id, name, email FROM users
        `;
        const today = new Date();

        const order = await sql`INSERT INTO orders (userId, productId, total, payment, createdAt, updatedAT)
                                VALUES (${user[0].id}, ${product[0].id}, ${total}, false, ${today}, ${today})
                                    RETURNING *`;
        res.send(order[0]);
    } else {
        res.status(400).send(result);
    }
});

app.get("/orders", async (req, res) => {
    const orders = await sql`
        SELECT orders.*, users.*, products.* 
        FROM orders 
        JOIN users ON orders.userId = users.id 
        JOIN products ON orders.productId = products.id
    `;

    res.send(orders);
});

app.get("/orders/:id", async (req, res) => {
    const order = await sql`
        SELECT orders.*, users.*, products.* 
        FROM orders 
        JOIN users ON orders.userId = users.id 
        JOIN products ON orders.productId = products.id
        WHERE orders.id=${req.params.id}
    `;

    if (order.length > 0) {
        res.send(order[0]);
    } else {
        res.status(404).send({ message: "Order not found" });
    }
});
  

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
