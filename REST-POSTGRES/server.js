const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const crypto = require("crypto");
const specs = require("./swaggerConfig");

const app = express();
const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password",port:  1234});

app.use(express.json());

// Schemas
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
  console.log(`Listening on http://localhost:${port}`);
});

	
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


/**
 * @swagger
 * /products:
 *   get:
 *     description: Retrieve all products
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal Server Error
 */
app.get("/products", async (req, res) => {
  try {
    let query = sql`SELECT * FROM products`;

    // Filtrage par titre
    if (req.query.title) {
      query = sql`${query} WHERE name ILIKE '%' || ${req.query.title} || '%'`;
    }

    // Filtrage par description
    if (req.query.about) {
      if (req.query.title) {
        query = sql`${query} AND about ILIKE '%' || ${req.query.about} || '%'`;
      } else {
        query = sql`${query} WHERE about ILIKE '%' || ${req.query.about} || '%'`;
      }
    }

    // Filtrage par prix
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

    if (req.query.title) {
        const title = req.query.title;
        query += ` AND name ILIKE '%${title}%'`; 
    }

   
    if (req.query.about) {
        const about = req.query.about;
        query += ` AND about ILIKE '%${about}%'`; 
    }
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
name: z.string(),
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
    const { name, email, password } = result.data;
    const hashedPassword = hashPassword(password);

    const user = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
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
        UPDATE users SET username=${username}, email=${email}, password=${hashedPassword}
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
        UPDATE user SET ${sql(updateFields)} WHERE id=${req.params.id}
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

const fetchFreeToGameAPI = async () => {
  try {
    const response = await fetch("https://www.freetogame.com/api/games");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching FreeToGame API:", error.message);
    throw error;
  }
};

app.get("/f2p-games", async (req, res) => {
  try {
    const games = await fetchFreeToGameAPI();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/f2p-games/:id", async (req, res) => {
  try {
    const games = await fetchFreeToGameAPI();
    const game = games.find((game) => game.id == req.params.id);
    if (game) {
      res.json(game);
    } else {
      res.status(404).json({ message: "Game not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const OrderSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  total: z.number().positive(),
  payment: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date())
});

// Endpoint pour créer une commande
app.post("/paniers", async (req, res) => {
  const result = OrderSchema.safeParse(req.body);

  if (result.success) {
    const { userId, productId } = req.body;

    try {
      
      const product = await sql`
        SELECT price FROM products WHERE id = ${productId}
      `;
      
      if (product.length === 0) {
        return res.status(404).json({ message: "Product not found" });
      }

      const price = product[0].price;
      const total = price * 1.2; 

      const order = await sql`
        INSERT INTO panier (userId, productId, total)
        VALUES (${userId}, ${productId}, ${total})
        RETURNING *
      `;
      res.json(order[0]);
    } catch (error) {
      console.error("Error creating order:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(400).json({ error: "Invalid cart data" });
  }
});


app.get("/paniers", async (req, res) => {
  try {
    const orders = await sql`
      SELECT * FROM panier
    `;
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/paniers/:id", async (req, res) => {
  try {
    const order = await sql`
      SELECT * FROM panier WHERE id = ${req.params.id}
    `;
    if (order.length > 0) {
      res.json(order[0]);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error fetching order:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.delete("/paniers/:id", async (req, res) => {
  try {
    const order = await sql`
      DELETE FROM panier WHERE id = ${req.params.id} RETURNING *
    `;
    if (order.length > 0) {
      res.json(order[0]);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    console.error("Error deleting order:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});