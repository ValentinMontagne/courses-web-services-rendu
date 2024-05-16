const express = require("express");
const postgres = require("postgres");
const z = require("zod");
var crypto = require("crypto");

const app = express();
app.use(express.json());
const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password" });

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

// Schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});
const CreateProductSchema = ProductSchema.omit({ id: true });

const UsersSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
});

const CreateUsersSchema = UsersSchema.omit({ id: true });
const PatchUsersSchema = UsersSchema.omit({ id: true }).partial({
  username: true,
  email: true,
  password: true,
});

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

app.get("/products", async (req, res) => {
  var title = "%" + (req.query.title ? req.query.title : "") + "%";
  var about = "%" + (req.query.about ? req.query.about : "") + "%";
  var price = (req.query.price ? req.query.price : null);
  console.log(title)
  var product;

  if(price){
    product = await sql`
      SELECT * FROM products
      WHERE name LIKE ${title}
      AND about LIKE ${about}
      AND price <= ${price}
      `;
  }else{
    product = await sql`
      SELECT * FROM products
      WHERE name LIKE ${title}
      AND about LIKE ${about}
      `;
  }

  if (product.length > 0) {
    res.send(product);
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
  const result = await CreateUsersSchema.safeParse(req.body);

  // If Zod parsed successfully the request body
  if (result.success) {
    const { username, email, password } = result.data;

    var hash = crypto.createHash("sha512");
    var hashPassword = hash.update(password, "utf-8");
    //Creating the hash in the required format
    hashPassword = hashPassword.digest("hex");

    const user = await sql`
      INSERT INTO users (username, email, password)
      VALUES (${username}, ${email}, ${hashPassword})
      RETURNING id, username, email
      `;

    res.send(user[0]);
  } else {
    res.status(400).send(result);
  }
});

app.patch("/users/:id", async (req, res) => {
  const result = await PatchUsersSchema.safeParse(req.body);

  // If Zod parsed successfully the request body
  if (result.success) {
    const { username, email, password } = result.data;

    var currentUser = await sql`
      SELECT * FROM users WHERE id=${req.params.id}
      `;
    if (currentUser.length == 0) {
      res.status(404).send({ message: "Not found" });
      return
    }

    currentUser = currentUser[0]

    if (username != undefined) {
      currentUser.username = username;
    }
    if (email != undefined) {
      currentUser.email = email;
    }
    if (password != undefined) {
      var hash = crypto.createHash("sha512");
      var hashPassword = hash.update(password, "utf-8");
      hashPassword = hashPassword.digest("hex");
      currentUser.password = hashPassword;
    }

    const user = await sql`
    UPDATE users
    SET username=${currentUser.username}, email=${currentUser.email}, password=${currentUser.password}
    WHERE id=${req.params.id}
    RETURNING id, username, email
    `;
    console.log("test");
    if (user.length > 0) {
      res.send(user[0]);
    } else {
      res.status(404).send({ message: "Not found" });
    }
  } else {
    res.status(400).send(result);
  }
});

app.put("/users/:id", async (req, res) => {
  const result = await CreateUsersSchema.safeParse(req.body);

  // If Zod parsed successfully the request body
  if (result.success) {
    const { username, email, password } = result.data;

    var hash = crypto.createHash("sha512");
    var hashPassword = hash.update(password, "utf-8");
    //Creating the hash in the required format
    hashPassword = hashPassword.digest("hex");

    const user = await sql`
      UPDATE users
      SET username=${username}, email=${email}, password=${hashPassword}
      WHERE id=${req.params.id}
      RETURNING id, username, email
      `;

    if (user.length > 0) {
      res.send(user[0]);
    } else {
      res.status(404).send({ message: "Not found" });
    }
  } else {
    res.status(400).send(result);
  }
});

app.get("/f2p-games/:id", async (req, res) => {
  const response = await fetch('https://www.freetogame.com/api/game?id=' + req.params.id);
  const data = await response.json();
  res.send(data)
});

app.get("/f2p-games", async (req, res) => {
  const response = await fetch('https://www.freetogame.com/api/games');
  const data = await response.json();
  res.send(data);
});



app.get("/", (req, res) => {
  res.send("Hello World!");
});
