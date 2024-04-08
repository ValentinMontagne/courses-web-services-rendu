const express = require("express");
const router = express.Router();
const postgres = require("postgres");
const z = require("zod");

const sql = postgres({ db: "mydb", user: "user", password: "password" });

// Schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});
const CreateProductSchema = ProductSchema.omit({ id: true });


router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const product = await sql`
      SELECT * FROM products--
      WHERE id = ${id};
    `;

    if (product.length > 0) {
      res.send(product[0]);
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/", async (req, res) => {
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

router.delete("/:id", async (req, res) => {
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

module.exports = router;
