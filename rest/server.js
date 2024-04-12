const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const fetch = require('node-fetch');
const {date} = require("zod");

const app = express();

app.use(express.json());

const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password" });

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
    name: z.string(),
    password: z.string(),
    email: z.string(),
});
const CreateUserSchema = UserSchema.omit({ id: true });

const OrderSchema = z.object({
    id: z.string(),
    userId: z.string(),
    productId: z.string(),
    total: z.number().positive(),
    payment: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
const CreateOrdersSchema = OrderSchema.omit({ id: true });

app.post("/products", async (req, res) => {
    const result = await CreateOrdersSchema.safeParse(req.body);

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

app.get("/products?title=:title", async (req, res) => {
    const product = await sql`SELECT * FROM products WHERE name LIKE '%' || ${req.params.title} || '%'`;
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
    const result = await CreateUserSchema.safeParse(req.body);
    if (result.success) {
        const { name, password, email } = result.data;

        const user = await sql`
    INSERT INTO users (name, password, email)
    VALUES (${name}, ${password}, ${email})
    RETURNING *
    `;

        res.send(user[0]);
    } else {
        res.status(400).send(result);
    }
});

app.get("/users", async (req, res) => {
    const user = await sql`
    SELECT name, email FROM users
    `;

    res.send(user);
});

app.get("/users/:id", async (req, res) => {
    const user = await sql`
    SELECT name, email FROM users WHERE id=${req.params.id}
    `;

    if (user.length > 0) {
        res.send(user[0]);
    } else {
        res.status(404).send({ message: "Not found" });
    }
});

app.delete("/user/:id", async (req, res) => {
    const user = await sql`
    DELETE FROM users
    WHERE id=${req.params.id}
    RETURNING *
    `;

    if (user.length > 0) {
        res.send(user[0]);
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


app.get("/", (req, res) => {
    res.send("Hello World!");
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