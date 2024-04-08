const express = require("express");
const app = express();
const port = 8000;
const postgres = require("postgres");
const z = require("zod");
const crypto = require('crypto');

 
app.use(express.json());
const sql = postgres({ db: "mydb", user: "postgres", password: "admin" });

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
    email: z.string(),
    password: z.string(),
  });

  	
const CreateUserSchema = UserSchema.omit({ id: true });

const OptionalUserSchema = z.object({
    id: z.string(),
    username: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
  });

const PatchUserSchema = OptionalUserSchema.omit({ id: true });


//products
//POST
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

//GET
app.get("/products", async (req, res) => {
    const products = await sql`
      SELECT * FROM products
      `;
  
    res.send(products);
  });

//GET BY ID
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

//DELETE
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

//users
//POST
app.post("/users", async (req, res) => {
    const result = await CreateUserSchema.safeParse(req.body);
   
    // If Zod parsed successfully the request body
    if (result.success) {
      const { username, email, password } = result.data;
      const hashedPassword = crypto.createHash('sha512').update(password).digest('hex');
      const user = await sql`
      INSERT INTO users (username, email, password)
      VALUES (${username}, ${email}, ${hashedPassword})
      RETURNING id, username, email
      `;
   
      res.send(user[0]);
    } else {
      res.status(400).send(result);
    }
  });

//GET
app.get("/users", async (req, res) => {
    const users = await sql`
      SELECT id, username, email FROM users
      `;
  
    res.send(users);
  });

//GET BY ID
app.get("/users/:id", async (req, res) => {
    const user = await sql`
        SELECT id, username, email FROM users WHERE id=${req.params.id}
        `;
      
        if (user.length > 0) {
          res.send(user[0]);
        } else {
          res.status(404).send({ message: "Not found" });
        }
      });

//DELETE
app.delete("/users/:id", async (req, res) => {
    const product = await sql`
        DELETE FROM users
        WHERE id=${req.params.id}
        RETURNING id, username, password
        `;
      
        if (product.length > 0) {
          res.send(product[0]);
        } else {
          res.status(404).send({ message: "Not found" });
        }
      });

//PUT
app.put("/users/:id", async (req, res) => {
    const userId = req.params.id;
    const result = await CreateUserSchema.safeParse(req.body);
   
    if (result.success) {
        const { username, email, password } = result.data;
        const hashedPassword = crypto.createHash('sha512').update(password).digest('hex');
        
        const updatedUser = await sql`
            UPDATE users
            SET username = ${username}, email = ${email}, password= ${hashedPassword}
            WHERE id = ${userId}
            RETURNING id, username, email
        `;
   
        res.send(updatedUser[0]);
    } else {
        res.status(400).send(result);
    }
});

//PATCH
app.patch("/users/:id", async (req, res) => {
    const userId = req.params.id;
    const result = await PatchUserSchema.safeParse(req.body);
    if (result.success) {
        const updateData = result.data;

        try {
            if (!updateData.username && !updateData.password && !updateData.email) {
                res.status(400).send("Bad Request: Veuillez fournir au moins un champ à mettre à jour (username ou password).");
                return;
            }
            if (updateData.password){
                updateData.password = crypto.createHash('sha512').update(updateData.password).digest('hex');
            }
            const updateQuery = sql`
                UPDATE users
                SET ${sql(updateData, ...Object.keys(updateData))}
                WHERE id = ${userId}
                RETURNING id, username, email
                `
            ;

            const updatedUser = await updateQuery;

            if (updatedUser.length > 0) {
                res.send(updatedUser[0]);
            } else {
                res.status(404).send("User not found");
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.status(400).send(result);
    }
});

app.get("/f2p-games", async (req, res) => {
  const fetch = await import('node-fetch').then(module => module.default);
    try {
        const response = await fetch('https://www.freetogame.com/api/games');
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des jeux Free-to-Play');
        }
        
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Une erreur est survenue lors de la récupération des jeux Free-to-Play.');
    }
});

app.get("/f2p-games/:id", async (req, res) => {
  const gameId = req.params.id;
  const fetch = await import('node-fetch').then(module => module.default);
    try {
        const response = await fetch(`https://www.freetogame.com/api/game?id=${gameId}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des jeux Free-to-Play');
        }
        
        const data = await response.json();

        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(404).send('Jeu non trouvé');
    }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
