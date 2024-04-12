const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const {createHash} = require("crypto");


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

const userShema = z.object({
    id: z.string(),
    username: z.string(),
    password: z.string(),
    email: z.string(),
});
const CreateUserSchema = userShema.omit({ id: true });
const PutUserSchema = userShema;
const PatchUserSchema = userShema.omit({username: true,email: true});

const orderSchema = z.object({
    id: z.number(),
    userid: z.number(),
    total: z.number(),
    payement: z.boolean(),
    created: z.date(),
    updated: z.date(),
});

const CreateOrdersSchema = orderSchema.omit({ id: true, updated: true,created: true });
const PatchOrdersSchema = orderSchema.omit({userid: true, total: true, created: true, updated: true });


app.post("/orders/", async (req, res) => {

    const result = await CreateOrdersSchema.safeParse(req.body);

    if (result.success) {
        const { userid, total, payement} = result.data;

        let createdAt = new Date();
        let updatedAt = new Date();

        const product = await sql`
            INSERT INTO orders (userid, total, payement ,created, updated)
            VALUES (${userid}, ${total}, ${payement}, ${createdAt}, ${updatedAt})
            RETURNING *
        `;

        res.send(product);
    } else {
        res.status(400).send(result);
    }
});

app.get("/orders/", async (req, res) => {

    const orders = await sql`
            SELECT o.*, u.username, u.email FROM orders o INNER JOIN users u ON o.userid = u.id;
    `;

    if(orders.length > 0){
        res.send(orders);
    }else{
        res.status(404).send({ message: "Not found" });
    }

});

app.patch("/orders/payement", async (req, res) => {

    const result = await PatchOrdersSchema.safeParse(req.body);

    // If Zod parsed successfully the request body
    if (result.success) {
        const {payement , id} = result.data;
        let updatedAt = new Date();

        await sql`
            UPDATE orders
            SET payement = ${payement}, updated = ${updatedAt}
            WHERE id = ${id}
        `;

        res.send("Orders as update");
    } else {
        res.status(400).send(result);
    }

});


app.get("/f2p-games/", async (req, res) => {

    import('node-fetch').then(async fetch => {
        const response = await fetch.default('https://www.freetogame.com/api/games');
        const data = await response.json();
        res.send(data);
    })

});

app.get("/f2p-games/:id", async (req, res) => {

    const id  = req.params.id;

    import('node-fetch').then(async fetch => {
        const response = await fetch.default('https://www.freetogame.com/api/game?id=' + id);
        const data = await response.json();
        res.send(data);
    })

});

app.post("/user/", async (req, res) => {

    const result = await CreateUserSchema.safeParse(req.body);

    // If Zod parsed successfully the request body
    if (result.success) {
        const { username, password, email } = result.data;
        let passCrypt = createHash('sha256').update(password).digest('hex');

        await sql`
            INSERT INTO users (username, password, email)
            VALUES (${username}, ${passCrypt}, ${email})
            RETURNING *
        `;

        res.send("User Created OK");
    } else {
        res.status(400).send(result);
    }
});

app.get("/user/", async (req, res) => {

    const users = await sql`
            SELECT id, email, username FROM users;
    `;

    if(users.length > 0){
        res.send(users);
    }else{
        res.status(404).send({ message: "Not found" });
    }

});

app.put("/user/", async (req, res) => {

    const result = await PutUserSchema.safeParse(req.body);

    // If Zod parsed successfully the request body
    if (result.success) {
        const { username, password, email, id } = result.data;
        let passCrypt = createHash('sha256').update(password).digest('hex');

        await sql`
            UPDATE users
            SET username = ${username}, password = ${passCrypt}, email = ${email}
            WHERE id = ${id}
        `;

        res.send("User PUT OK");
    } else {
        res.status(400).send(result);
    }

});

app.patch("/user/password", async (req, res) => {

    const result = await PatchUserSchema.safeParse(req.body);

    // If Zod parsed successfully the request body
    if (result.success) {
        const {password, id } = result.data;
        let passCrypt = createHash('sha256').update(password).digest('hex');

        await sql`
            UPDATE users
            SET password = ${passCrypt}
            WHERE id = ${id}
        `;

        res.send("User password change");
    } else {
        res.status(400).send(result);
    }

});

app.post("/products/", async (req, res) => {

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

app.get("/products/:id", async (req, res) => {
    const id  = req.params.id;

    const product = await sql`
        SELECT * FROM products WHERE id = ${id};
    `;

    if (product.length > 0) {
        res.send(product);
    }else{
        res.status(404).send({ message: "Not found" });
    }

});

app.get("/products", async (req, res) => {

    const product = await sql`
    SELECT *
    FROM products;`;

    if (product.length > 0) {
        res.send(product);
    } else {
        res.status(404).send({ message: "Not found" });
    }

});

app.delete("/products/:id", async (req, res) => {
    const id = req.params.id;

    const product = await sql`
        DELETE FROM products
        WHERE id = ${id};
        RETOURNING *
    `;

    if (product.length > 0) {
        res.send(product[0]);
    } else {
        res.status(404).send({ message: "Not found" });
    }
});

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});
