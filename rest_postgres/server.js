const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const crypto = require("crypto");

const app = express();
const PORT = 8000;
const sql = postgres({
    db: "mydb", 
    user: "user",
    password: "password"
});

app.use(express.json());

const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    about: z.string(),
    price: z.number().positive(),
})

const CreateProductSchema = ProductSchema.omit( {id: true});

app.post("/products", async (req, res) => {
    const result = await CreateProductSchema.safeParse(req.body);
    // If Zod successfully parsed the request body
    if (result.success) {
        const { name, about, price } = result.data;

        const product = await sql`
        INSERT INTO products (name, about, price)
        VALUES (${name}, ${about}, ${price})
        RETURNING *
        `;

        res.send(product[0]);
    } else {
        req.statusCode(400).send(result);
    }
})

app.get("/", (req, res) => {
    res.send("Hello World!");
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
        res.status(404).send( { message: "Not found"})
    }
});

app.delete("/products/:id", async (req, res) => {
    const product = await sql `
    DELETE FROM products
    WHERE id = ${ req.params.id }
    RETURNING *
    `;

    if (product.length > 0 ) {
        res.send(product[0]);
    } else {
        res.status(404).send({ message: "Not found"});
    }
});

const UserSchema = z.object({
    id: z.string(),
    pseudo: z.string(),
    email: z.string(),
    password: z.string(),
})

const CreateUserSchema = UserSchema.omit( {id: true});

app.get("/users", async (req, res) => {
    const users = await sql`
    SELECT id, pseudo, email
    FROM users
    `
    res.send(users)
});

app.get("/users/:id", async (req, res) => {
    const user = await sql`
    SELECT pseudo, email FROM users WHERE id=${req.params.id}
    `;

    if (user.length > 0) {
        res.send(user[0]);
    } else {
        res.status(404).send( { message: "Not found"})
    }
});

app.post("/users", async (req, res) => {
    const result = await CreateUserSchema.safeParse(req.body);
    // If Zod successfully parsed the request body
    if (result.success) {
        const { pseudo, email, password } = result.data;

        var hash = crypto.createHash("sha512");

        hashedPassword = hash.update(password, "utf-8");
        gen_hash = hashedPassword.digest("hex");

        const product = await sql`
        INSERT INTO users (pseudo, email, password)
        VALUES (${pseudo}, ${email}, ${gen_hash})
        RETURNING id, pseudo, email
        `;

        res.send(product[0]);
    } else {
        req.statusCode(400).send(result);
    }
});

app.delete("/users/:id", async (req, res) => {
    const user = await sql `
    DELETE FROM users
    WHERE id = ${ req.params.id }
    RETURNING *
    `;

    if (user.length > 0 ) {
        res.send(user[0]);
    } else {
        res.status(404).send({ message: "Not found"});
    }
});

app.put("/users/:id", async (req, res) => {
    const result = await CreateUserSchema.safeParse(req.body);
    // If Zod successfully parsed the request body
    if (result.success) {
        const { pseudo, email, password } = result.data;

        var hash = crypto.createHash("sha512");

        hashedPassword = hash.update(password, "utf-8");
        gen_hash = hashedPassword.digest("hex");
        console.log(pseudo, email);

        const user = await sql`
        UPDATE users
        SET pseudo = ${pseudo}, email = ${email}, password = ${gen_hash}
        where id = ${req.params.id}
        RETURNING id, pseudo, email
        `;

        res.send(user[0]);
    } else {
        req.statusCode(400).send(result);
    }
});

app.get("/f2p-games", async (req, res) => {
    import('node-fetch').then(fetch => {
        res.send(fetch.default("https://www.freetogame.com/api/games"));
    })
})





app.listen(PORT, () => {
    console.log(`Listening on http://localhost${PORT}`)
});