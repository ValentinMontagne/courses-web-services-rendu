const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const bcrypt = require('bcrypt');
//const { default: fetch } = require("node-fetch");
const saltRounds = 10;

const app = express()
app.use(express.json());;
const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password" });
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// Schemas
const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    about: z.string(),
    price: z.number().positive(),
});
const UserSchema = z.object({
    id: z.string(),
    username: z.string(),
    email: z.string,
    password: z.string(),
});


const CreateProductSchema = ProductSchema.omit({ id: true });
const CreateUsersSchema = UserSchema.omit({ id: true });

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/f2p-games", (req, res) => {
    import("node-fetch").then(async (fetch) => {
        let result = await fetch.default("https://www.freetogame.com/api/games")
        //console.log(await result.json())
        res.send(await result.json());
    })
});

app.get("/products", async (req, res) => {
    result = await sql` 
    SELECT * FROM products`

    res.send(result);
});

app.get("/products", async (req, res) => {
    result = await sql` 
    SELECT * FROM products where title = ${req.query.title}`

    res.send(result);
});

app.get("/products", async (req, res) => {
    result = await sql` 
    SELECT * FROM products where about = ${req.query.about}`

    res.send(result);
});

app.get("/products", async (req, res) => {
    result = await sql` 
    SELECT * FROM products where price = ${req.query.price}`

    res.send(result);
});

app.get("/products/:id", async (req, res) => {
    product = await sql` 
    SELECT * FROM products
    WHERE id=${req.params.id}`
    if (product.length > 0) {
        res.send(product[0]);
    } else {
        res.status(404).send({ message: "Not found" });
    }
    res.send(product);
});
app.post("/products", async (req, res) => {
    const data = CreateProductSchema.safeParse(req.body);
    console.log(data, "ici", req.body);
    if (!data.success) {
        res.send(400)
    }
    const { name, about, price } = data.data;

    result = await sql` 
    INSERT INTO products (name, about, price)
    VALUES (${name}, ${about}, ${price})
    RETURNING *
    `
    res.send(result);
});

app.delete("/products/:id", async (req, res) => {
    result = await sql` 
    DELETE FROM products
    WHERE id=${req.params.id}
    RETURNING *`

    if (result.length > 0) {
        res.send(result[0]);
    } else {
        res.status(404).send({ message: "Not found" });
    }
    res.send(result);
});

app.get("/users", async (req, res) => {
    result = await sql` 
    SELECT * FROM users`

    res.send(result);
});

app.get("/users/:id", async (req, res) => {
    product = await sql` 
    SELECT * FROM users
    WHERE id=${req.params.id}`
    if (product.length > 0) {
        res.send(product[0]);
    } else {
        res.status(404).send({ message: "Not found" });
    }
    res.send(product);
});

app.patch("/users/:id", async (req, res) => {
    //const data = CreateProductSchema.safeParse(req.body);

    if (!data.success) {
        res.send(400)
    }

    if (req.body.username != undefined) {

        user = await sql` 
        UPDATE users
        SET username = ${req.body.username}
        WHERE id=${req.params.id}
        RETURNING *`
    }

    if (req.body.email != undefined) {

        user = await sql` 
        UPDATE users
        SET email = ${req.body.email}
        WHERE id=${req.params.id}
        RETURNING *`
    }
    if (req.body.password != undefined) {
        let hashedPassword

        bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
            hashedPassword = hash
        });
        user = await sql` 
        UPDATE users
        SET password = ${hashedPassword}
        WHERE id=${req.params.id}
        RETURNING *`
    }

    if (user.length > 0) {
        res.send(user[0]);
    } else {
        res.status(404).send({ message: "Not found" });
    }
    res.send(user);
});

app.put("/users/:id", async (req, res) => {
    const data = CreateProductSchema.safeParse(req.body);

    let hashedPassword

    const { username, email, password } = data.data;

    bcrypt.hash(password, saltRounds, function (err, hash) {
        hashedPassword = hash
    });

    user = await sql` 
    UPDATE users
    SET username = ?, password = ?, email = ?
    VALUES (${username}, ${hashedPassword}, ${email})
    WHERE id=${req.params.id}
    RETURNING *`

    res.send(user);
});

app.post("/users", async (req, res) => {
    const data = CreateUsersSchema.safeParse(req.body);
    if (!data.success) {
        res.send(400)
    }
    let hashedPassword
    const { username, email, password } = data.data;
    bcrypt.hash(password, saltRounds, function (err, hash) {
        hashedPassword = hash
    });


    result = await sql` 
    INSERT INTO users (username, email, password)
    VALUES (${username}, ${email}, ${hashedPassword})
    RETURNING *
    `
    res.send(result);
});

app.get('/orders', async (req, res) => {
    try {
        result = await sql`
            SELECT orders.id, orders.total, orders.payement, orders.createdAt, orders.updatedAt, 
            users.id AS userId, users.username AS userName, users.email AS userEmail
            FROM orders
            JOIN users ON orders.userid = users.id
        `;

        res.json(result);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
