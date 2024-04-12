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
const CreateProductSchema = ProductSchema.omit({ id: true });

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/products", async (req,res) => {
    const result = await CreateProductSchema.safeParse(req.body);

    const { name, about, price } = res.data;
    const product = await sql`
    INSERT INTO products (name, about, price)
    VALUES (${name}, ${about}, ${price})
    RETURNING *
    `;

    res.send(product[0]);
});

app.get("/products/:id", async (req, res) => {

    const product = await sql`
            SELECT * FROM products WHERE id = ${req.params.id}
    `;

    res.send(product);
});

app.get("/products/", async (req, res) => {
    const products = await sql`
            SELECT * FROM products;
    `;
    res.send(products)
})

app.post("/products/", async (req,res) => {

} )


app.delete("/products/{$id}")





app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
