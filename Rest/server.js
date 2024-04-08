const express = require("express");
const app = express();
const port = 8000;
const postgres = require("postgres");
const zod = require("zod");



// Utilisation de l'importation dynamique pour résoudre l'erreur ERR_REQUIRE_ESM
import("node-fetch").then(({ default: fetch }) => {
  const app = express();
  const port = 8000;
  const sql = postgres({ db: "mydb", user: "user", password: "password" });

  app.use(express.json());
  app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });

  /* F2P GAMES */

  app.get("/f2p-games", async (req, res) => {
    try {
      const response = await fetch("https://www.freetogame.com/api/games");

      if (response.ok) {
        const data = await response.json();

        res.send(data);
      } else {
        res.status(response.status).send("Error fetching Free-to-Play games");
      }
    } catch (error) {
      console.error("Error fetching Free-to-Play games:", error);
      res.status(500).send("Error fetching Free-to-Play games");
    }
  });

  app.get("/f2p-games/:id", async (req, res) => {
    const gameId = req.params.id;
    try {
      const response = await fetch(
        `https://www.freetogame.com/api/game?id=${gameId}`
      );

      if (response.ok) {
        const data = await response.json();

        res.send(data);
      } else {
        res
          .status(response.status)
          .send("Error fetching Free-to-Play game details");
      }
    } catch (error) {
      console.error("Error fetching Free-to-Play game details:", error);
      res.status(500).send("Error fetching Free-to-Play game details");
    }

    // Schemas
    const ProductSchema = zod.object({
      id: zod.string(),
      name: zod.string(),
      about: zod.string(),
      price: zod.number().positive(),
    });

    const CreateProductSchema = ProductSchema.omit({ id: true });

    app.use(express.json());

    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.get("/products", async (req, res) => {
      try {
        // Exécute la requête SQL pour récupérer tous les produits
        const result = await sql("SELECT * FROM products");
        const products = result.rows;

        // Valide les données des produits avec le schéma Zod
        const validatedProducts = products.map((product) =>
          ProductSchema.parse(product)
        );

        // Renvoie les produits validés
        res.json(validatedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        res
          .status(500)
          .json({ error: "An error occurred while fetching products" });
      }
    });

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

    app.delete("/products/:id", async (req, res) => {
      const productId = req.params.id;

      try {
        // Exécuter une requête SQL DELETE pour supprimer le produit de la base de données
        const result = await sql`DELETE FROM products WHERE id = ${productId}`;

        // Vérifier si le produit a été supprimé avec succès
        if (result.rowCount === 0) {
          // Si aucun produit correspondant n'a été trouvé, renvoyer un message d'erreur
          res.status(404).json({ success: false, error: "Product not found" });
        } else {
          // Si le produit a été supprimé avec succès, renvoyer une réponse de succès
          res
            .status(200)
            .json({ success: true, message: "Product deleted successfully" });
        }
      } catch (error) {
        // En cas d'erreur lors de la suppression du produit, renvoyer un message d'erreur
        console.error("Error deleting product:", error);
        res
          .status(500)
          .json({ success: false, error: "Internal server error" });
      }
    });

    app.delete("/products/delete/all", async (req, res) => {
      try {
        const result = await sql`DELETE FROM products`;

        if (result.rowCount === 0) {
          res
            .status(404)
            .json({ success: false, error: "Produit introuvable" });
        } else {
          res
            .status(200)
            .json({
              success: true,
              message: "Tout les produits sont supprimés  ",
            });
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de tout les produit");
        res.status(500).json({ succes: false, error: "Internal server error" });
      }
    });

    app.get("/products/:id", async (req, res) => {
      const productId = req.params.id;

      try {
        // Exécuter une requête SQL DELETE pour supprimer le produit de la base de données
        const result = await sql`SELECT FROM products WHERE id = ${productId}`;

        // Vérifier si le produit a été supprimé avec succès
        if (result.rowCount === 0) {
          // Si aucun produit correspondant n'a été trouvé, renvoyer un message d'erreur
          res.status(404).json({ success: false, error: "Product not found" });
        } else {
          // Si le produit a été supprimé avec succès, renvoyer une réponse de succès
          res.status(200).json({
            success: true,
            message: "Voici le produit numéro ",
            productID,
          });
        }
      } catch (error) {
        // En cas d'erreur lors de la suppression du produit, renvoyer un message d'erreur
        console.error("Error deleting product:", error);
        res
          .status(500)
          .json({ success: false, error: "Internal server error" });
      }
    });
    // Schemas

    const UserSchema = zod.object({
      username: zod.string(),
      email: zod.string().email(),
    });

    const CreateUserSchema = UserSchema.omit({ id: true });

    app.post("/users", async (req, res) => {
      const { username, email, password } = req.body;
      const result = CreateUserSchema.safeParse({ username, email, password });

      if (result.success) {
        const { username, email, password } = result.data;

        const hashedPassword = crypto
          .createHash("sha512")
          .update(password)
          .digest("hex");

        try {
          const newUser = await sql`
        INSERT INTO users (username, email, password)
        VALUES (${username}, ${email}, ${hashedPassword})
        RETURNING id, username, email
      `;

          res.status(201).send(newUser[0]);
        } catch (error) {
          console.error("Error creating user:", error);
          res.status(500).send("Error creating user");
        }
      } else {
        res.status(400).send(result.error);
      }
    });

    app.get("/users", async (_, res) => {
      try {
        const users = await sql`
        SELECT id, username, email FROM users
      `;
        res.send(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Error fetching users");
        console.log(req.body)
      }
    });

    app.get("/users/:id", async (req, res) => {
      const userId = req.params.id;
      try {
        const user = await sql`
        SELECT id, username, email FROM users WHERE id = ${userId}
      `;
        if (user.length === 0) {
          res.status(404).send("User not found");
        } else {
          res.send(user[0]);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).send("Error fetching user");
      }
    });

    app.put("/users/:id", async (req, res) => {
      const userId = req.params.id;
      const { username, email } = req.body;

      try {
        const updatedUser = await sql`
        UPDATE users SET username = ${username}, email = ${email} WHERE id = ${userId}
        RETURNING id, username, email
      `;
        if (updatedUser.length === 0) {
          res.status(404).send("User not found");
        } else {
          res.send(updatedUser[0]);
        }
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Error updating user");
      }
    });

    app.patch("/users/:id", async (req, res) => {
      const userId = req.params.id;
      const { email } = req.body;

      try {
        const updatedUser = await sql`
        UPDATE users SET email = ${email} WHERE id = ${userId}
        RETURNING id, username, email
      `;
        if (updatedUser.length === 0) {
          res.status(404).send("User not found");
        } else {
          res.send(updatedUser[0]);
        }
      } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send("Error updating user");
      }
    });
  });
});