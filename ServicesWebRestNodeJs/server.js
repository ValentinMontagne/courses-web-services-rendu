const express = require("express");
const postgres = require("postgres");
const z = require("zod");

const app = express();
const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password", port: "5458" });

app.use(express.json());
var crypto = require('crypto');
var hash = crypto.createHash('sha512');

// Schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});

const CreateProductSchema = ProductSchema.omit({ id: true });

const UserSchema = z.object({
  name: z.string(),
  email: z.string(),
  mdp: z.string(),
})

const CreateUserSchema = UserSchema.omit({id: true })

const OrderSchema = z.object({
  id: z.string(),
  username: z.string(),
  productId: z.string(),
  payment: z.boolean(),
})

const CreateOrderSchema = OrderSchema.omit({id: true })

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

app.post("/products", async (req, res) => {
  console.log(req.body);
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

app.get("/products", async (req, res) => {
  const {name, about, price}=req.query;
  const products = await sql`
    select * from products where 1=1 ${
        name
          ? sql`and name LIKE ${"%"+ name +"%"}`
          : sql``
        }${
        about
          ? sql`and about LIKE ${"%"+ about +"%"}`
          : sql``
        }${
        price
          ? sql`and price = ${price}`
          : sql``
        }
          
    `;
  res.send(products);
});

app.post("/users", async (req, res) => {
  const result = await CreateUserSchema.safeParse(req.body);
  if (result.success) {
    const { name, email, mdp } = result.data;
    data = hash.update(mdp, 'utf-8');

    const product = await sql`
    INSERT INTO users (name, email, mdp)
    VALUES (${name}, ${email}, ${""+data.digest('hex')})
    RETURNING name, email
    `;

    res.send(product[0]);
  } else {
    res.status(400).send(result);
  }
});

app.get("/users", async (req, res) => {
  const product = await sql`
      SELECT name, email FROM users where 1=1 ${
        req.queryname
          ? sql`and name LIKE ${"%"+ req.query.name +"%"}`
          : sql``
        }
      `;

  if (product.length > 0) {
    res.send(product[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.put("/user/:name", async (req, res) => {
  const result = await CreateUserSchema.safeParse(req.body);
  if (result.success) {
    const { name, email, mdp } = result.data;
    data = hash.update(mdp, 'utf-8');

    const product = await sql`
    UPDATE users
    SET name=${name}, email=${email}, mdp=${""+data.digest('hex')}
    WHERE name=${req.params.name}
    RETURNING name, email
    `;

    res.send(product[0]);
  } else {
    res.status(400).send(result);
  }
});

app.get("/f2p-games", async (req, res) => {
  import('node-fetch').then(fetch => {
    fetch.default('https://www.freetogame.com/api/games')
  });
  const response = await fetch('https://www.freetogame.com/api/games');
  const game = await response.json();
  res.send(game);
});

app.post("/orders", async (req, res) => {
  const result = await CreateOrderSchema.safeParse(req.body);
  if (result.success) {
    const {username, productId, payment} = result.data;
    const product = await sql`
    INSERT INTO orders (username, productId, total, payment, createdAt)
    VALUES (${username}, ${productId}, (select price from products where id=${productId})*1.2, ${payment}, ${Date.now()})
    RETURNING *
    `;

    res.send(product[0]);
  } else {
    res.status(400).send(result);
  }
});

app.get("/orders", async (req, res) => {
  const product = await sql`
      SELECT orders.id, username, email, products.name, about, total, payment from orders 
        join users on orders.username = users.name
        join products on orders.productId = products.id
      `;

  if (product.length > 0) {
    res.send(product[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

