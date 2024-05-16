const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const crypto = require('crypto');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = require("./swaggerOptions");

const app = express();
const port = 8000;
const sql = postgres({ db: "nodeJS", user: "postgres", password: "postgres" });

function hashPassword(password) {
    const hash = crypto.createHash('sha512');
    hash.update(password);
    return hash.digest('hex');
}
// Schemas
const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    about: z.string(),
    price: z.number().positive(),
});
const UserSchema = z.object( {
    id: z.string(),
    username : z.string(),
    password: z.string()
})
const OrderSchema = z.object( {
    id: z.string(),
    userid: z.string(),
    productid: z.string(),
    total : z.number().positive(),
    payment : z.boolean(),
    createdat : z.string(),
    updatedat: z.string(),
})
const CreateProductSchema = ProductSchema.omit({ id: true });
const CreateUserSchema = UserSchema.omit({id: true});
const CreateOrderSchema = OrderSchema.omit( {id: true, total: true ,payment: true,createdat: true, updatedat: true})
const UpdateUserSchema = UserSchema.omit({id: true});
const PatchUserSchema = z.object({
    username: z.string().optional(),
    password: z.string().optional(),
});
const PatchOrderSchema = z.object({
    userid: z.string().optional(),
    productid: z.string().optional(),
});

app.use(express.json());
/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     description: Returns a welcome message
 *     responses:
 *       200:
 *         description: Successful response with a welcome message
 */
app.get("/", (req, res) => {
    res.send("Hello World!");
});
/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     description: Retrieve a product by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the product
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful response with the product details
 *       404:
 *         description: Product not found
 */
app.get("/products/:id", async (req, res) => {
    const productId = req.params.id;
    try {
        const product = await sql`
            SELECT * FROM products
            WHERE id = ${productId}
        `;

        if (product.length > 0) {
            res.send(product[0]);
        } else {
            res.status(404).send("Product not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get a list of products
 *     description: Retrieve the list of all products
 *     responses:
 *       200:
 *         description: Successful response with the list of products
 */
app.get("/products", async (req, res) => {
    try {
        let query = "SELECT * FROM products";

        // Filtrage par 'about'
        if (req.query.about) {
            query += ` WHERE about LIKE '%${req.query.about}%'`;
        }
        // Filtrage par 'title'
        if (req.query.title) {
            query += query.includes("WHERE") ? ` AND title LIKE '%${req.query.title}%'` : ` WHERE title LIKE '%${req.query.title}%'`;
        }

        // Filtrage par 'price'
        if (req.query.price) {
            const price = parseFloat(req.query.price);
            if (!isNaN(price)) {
                query += query.includes("WHERE") ? ` AND price <= ${price}` : ` WHERE price <= ${price}`;
            }
        }

        const products = await sql.unsafe(query);

        res.send(products);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product with the provided data
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProductSchema'
 *     responses:
 *       200:
 *         description: Successful response with the created product
 *       400:
 *         description: Bad request or validation error
 */
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
app.delete("/products", async (req, res) => {
    const productId = req.params.id;

    try {
        const deletedProduct = await sql`
            DELETE FROM products
            WHERE id = ${productId}
            RETURNING *
        `;

        if (deletedProduct.length > 0) {
            res.send(deletedProduct[0]);
        } else {
            res.status(404).send("Product not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/users", async (req, res) => {
    try {
        const products = await sql`
            SELECT id, username FROM users
        `;
        res.send(products);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})
app.get("/users/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await sql`
            SELECT id, username FROM users
            WHERE id = ${userId}
        `;

        if (user.length > 0) {
            res.send(user[0]);
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})
app.post("/users", async (req, res) => {
    const result = await CreateUserSchema.safeParse(req.body);
    if (result.success) {
        let { username, password} = result.data;
        password = hashPassword(password)
        const product = await sql`
    INSERT INTO users (username, password)
    VALUES (${username}, ${password})
    RETURNING id, username
     `;
        res.send(product[0]);
    } else {
        res.status(400).send(result);
    }
})
app.put("/users/:id", async (req, res) => {
    const userId = req.params.id;
    const result = await UpdateUserSchema.safeParse(req.body);

    if (result.success) {
        const { username, password } = result.data;
        const hashedPassword = hashPassword(password);

        try {
            const updatedUser = await sql`
                UPDATE users
                SET username = ${username}, password = ${hashedPassword}
                WHERE id = ${userId}
                RETURNING id, username
            `;
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
app.patch("/users/:id", async (req, res) => {
    const userId = req.params.id;
    const result = await PatchUserSchema.safeParse(req.body);
    if (result.success) {
        const updateData = result.data;

        try {
            if (!updateData.username && !updateData.password) {
                res.status(400).send("Bad Request: Veuillez fournir au moins un champ à mettre à jour (username ou password).");
                return;
            }
            if (updateData.password){
                updateData.password = hashPassword(updateData.password);
            }
            const updateQuery = sql`
                UPDATE users
                SET ${sql(updateData, ...Object.keys(updateData))}
                WHERE id = ${userId}
                RETURNING id, username
            `;

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
app.delete("/users/:id", async (req, res) => {
    const userId = req.params.id;

    try {
        const deletedUser = await sql`
            DELETE FROM users
            WHERE id = ${userId}
            RETURNING id, username
        `;

        if (deletedUser.length > 0) {
            res.send(deletedUser[0]);
        } else {
            res.status(404).send("User not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/orders", async (req, res) => {
    try {
        const orders = await sql`
            SELECT * FROM Orders
        `;
        res.send(orders);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.get("/orders/:id", async (req, res) => {
    const orderId = req.params.id;
    try {
        const order = await sql`
            SELECT * FROM Orders
            WHERE id = ${orderId}
        `;

        if (order.length > 0) {
            res.send(order[0]);
        } else {
            res.status(404).send("Order not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})
app.delete("/orders/:id", async (req, res) => {
    const orderId = req.params.id;

    try {
        const deletedOrder = await sql`
            DELETE FROM orders
            WHERE id = ${orderId}
            RETURNING *
        `;

        if (deletedOrder.length > 0) {
            res.send(deletedOrder[0]);
        } else {
            res.status(404).send("Order not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.post("/orders", async (req, res) => {
    const result = await CreateOrderSchema.safeParse(req.body);
    const date = new Date();
    const dateLocale = date.getTime();

    let order = {
        userid: -1,
        productid: -1,
        total: -1,
        payment: false,
        createdat: dateLocale,
        updatedat: dateLocale
    };

    if (result.success) {
        const { userid, productid } = result.data;

        const user = await sql`
            SELECT id, username FROM users
            WHERE id = ${userid}
        `;

        if (user.length === 0) {
            return res.status(404).send("User not found");
        }

        order.userid = userid;

        const product = await sql`
            SELECT * FROM products
            WHERE id = ${productid}
        `;

        if (product.length === 0) {
            return res.status(404).send("Product not found");
        }

        order.productid = productid;
        order.total = product[0].price *1.2;

        const insertedOrder = await sql`
            INSERT INTO Orders (userid, productid, total, payment, createdat, updatedat)
            VALUES (${parseInt(order.userid)}, ${parseInt(order.productid)}, ${order.total}, ${order.payment}, ${order.createdat}, ${order.updatedat})
            RETURNING *
        `;

        res.send(insertedOrder[0]);
    } else {
        res.status(400).send(result);
    }
});
app.patch("/orders/:id/validatePayment", async (req, res) => {
    const orderId = req.params.id;
    try {
        const date = new Date();
        const dateLocale = date.getTime();

        const updatedOrder = await sql`
            UPDATE Orders
            SET payment = true, updatedat = ${dateLocale}
            WHERE id = ${orderId}
            RETURNING *
        `;

        if (updatedOrder.length > 0) {
            res.send(updatedOrder[0]);
        } else {
            res.status(404).send("Order not found");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});
app.patch("/orders/:id", async (req, res) => {
    const orderId = req.params.id;
    const result = await PatchOrderSchema.safeParse(req.body);
    if (result.success) {
        const updateData = result.data;
        try {
            const date = new Date();
            const dateLocale = date.getTime();
            if (!updateData.userid && !updateData.productid) {
                res.status(400).send("Bad Request: Veuillez fournir au moins un champ à mettre à jour (username ou password).");
                return;
            }
            if (updateData.productid){
                const product = await sql`
            SELECT * FROM products
            WHERE id = ${updateData.productid}
        `;

                if (product.length === 0) {
                    return res.status(404).send("Product not found");
                }

                updateData.total = product[0].price *1.2;
            }

            updateData.updatedat = dateLocale;
            const updateQuery = sql`
                UPDATE orders
                SET ${sql(updateData, ...Object.keys(updateData))}
                WHERE id = ${orderId}
                RETURNING *
            `;

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


const specs = swaggerJsdoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
});

