const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const app = express();
const crypto = require("crypto");
const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password" });

app.use(express.json());
const filters = {
  NAME: "name",
  ABOUT: "about",
  PRICE: "price",
}

// Schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});
const CreateProductSchema = ProductSchema.omit({ id: true });

const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
});

const OrderScheman = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  total: z.number(),
  payment: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const CreateOrderSchema = OrderScheman.omit({ id: true, createdAt: true, updatedAt: true });

const CreateUserSchema = userSchema.omit({ id: true });
const PatchUserSchema = userSchema.partial({
  username: true,
  email: true,
  password: true,
});
const PatchUser = PatchUserSchema.omit({ id: true });

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

app.get("/products", async (req, res) => {
        const query = req.query
        const setTitleFilter = (name) => sql`AND name LIKE ${'%'+ name + '%'}`;
        const setAboutFilter = (name) => sql`AND about LIKE ${'%'+ name + '%'}`;
        const setPriceFilter = (name) => sql`AND price LIKE ${'%'+ nae + '%'}`;
        const products = await sql`
        SELECT * FROM products
        WHERE 1=1 ${ query.name ?  setTitleFilter(query.name) : sql``}
        `
  
    return res.send(products);
});


app.get("/products/:id", async (req, res) => {
  const id = req.params.id;
 
  const product = await sql`
      SELECT * FROM products WHERE products.id = ${id}`;

  if (product.length > 0) {
    res.send(product[0]);
  } else {
    res.status(404).send({ message: "Product not found" });
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
  const { username, email, password } = req.body;

  if (result.success) {
    const hashPassword = crypto
      .createHash("sha512")
      .update(password, "utf-8")
      .digest("hex");
    const user = await sql`
      INSERT INTO users (username, email, password)
      VALUES (${username}, ${email}, ${hashPassword})
      RETURNING *
      `;

    res.send(user[0]);
  } else {
    res.status(400).send(result.error);
  }
});

app.get("/users/:id", async (req, res) => {
  const id = req.params.id;
  const user = await sql`
      SELECT * FROM users
      WHERE id=${id}`;

  if (user.length > 0) {
    delete user[0].password;
    res.send(user[0]);
  } else {
    res.status(404).send({ message: "User not found" });
  }
});

app.get("/users", async (req, res) => {
  users = await sql`
    SELECT * FROM users
    `;

  if (users.length > 0) {
    users.forEach((user) => {
      delete user.password;
    });
    res.send(users);
  } else {
    res.status(404).send({ message: "Users not found" });
  }
});

app.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { username, email, password } = req.body;
  const result = await CreateUserSchema.safeParse(req.body);
  if (result.success) {
    const hashPassword = crypto
      .createHash("sha512")
      .update(password, "utf-8")
      .digest("hex");
    const user = await sql`
        UPDATE users
        SET username=${username}, email=${email}, password=${hashPassword}
        WHERE id=${id}
        RETURNING *
        `;
    res.send(result);
  } else {
    res.status(400).send(result.error);
  }
});

app.patch("/users/:id", async (req, res) => {
  const result = PatchUser.safeParse(req.body);
  console.log(req.body);
  if (result.success) {
    const { id } = req.params;
    const { username, email, password } = result.data;
    const data = Object.keys(result.data)
      .map((key) => `${key} = ${result.data[key]}`)
      .join(", ");
    console.log("=====DATAAAA=", data);
    const hashPassword = crypto
      .createHash("sha512")
      .update(password, "utf-8")
      .digest("hex");
    const user = await sql`
          UPDATE users
          SET ${data}
          WHERE id=${id}
          RETURNING *
    //       `;
  }
});

app.delete("/users/:id", async (req, res) => {
  const product = await sql`
      DELETE FROM users
      WHERE id=${req.params.id}
      RETURNING *
      `;

  if (product.length > 0) {
    res.send(product[0]);
  } else {
    res.status(404).send({ message: "Not found" });
  }
});

app.get("/f2p-games", async (req, res) => {
    const games = await fetch("https://www.freetogame.com/api/games")
    res.send(await games.json());
})

app.get("/f2p-games/:id", async (req, res) => {
    const id = req.params.id
    console.log(id);
    const games = await fetch(`https://www.freetogame.com/api/game?id=${id}`)
    res.send(await games.json());
})

app.get("/orders", async (req, res) => {

    const orders = await sql`
    SELECT * FROM orders
    `

    orders ? res.send(orders) : res.status(404).send({ message: "Order not found" });

})

app.post("/orders", async (req, res) => {

    const result = await CreateOrderSchema.safeParse(req.body);
    console.log(result.success);
    if(result.success) {
        const { userId, productId, total, payment } = result.data;
        const order = await sql`
        INSERT INTO orders (userId, productId, total, payment, createdAt, updatedAt)
        VALUES (${userId}, ${productId}, ${total}, ${payment}, ${Date.now()}, ${Date.now()})
        RETURNING *
        `;
        res.send(order[0]);
    } else {
        res.status(400).send(result);
    }
})


app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
