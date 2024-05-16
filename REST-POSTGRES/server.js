/*
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nom VARCHAR(100),
  email VARCHAR(255),
  password VARCHAR(255)
)

create table Orders(
	userId int not NULL,
	orderId int not NULL,
	total int,
	payment bool,
	createAt date,
	updatedAt date,
	foreign key (userId) references users(id),
	foreign key (orderId) references products(id)	
)
*/

const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const fetch = require('node-fetch')

const app = express();
const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password" });
var crypto = require('crypto');

app.use(express.json());

function hash_password(password){
    var hash = crypto.createHash('sha512');
    data = hash.update(password, 'utf-8');
    gen_hash= data.digest('hex');
    return gen_hash;
}
// SCHEMAS

const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});

const UserSchema = z.object({
    id: z.string(),
    nom: z.string(),
    email: z.string(),
    password: z.string()
});

const OrderSchema = z.object({
    userId : z.string(),
    productId : z.string(),
    total: z.string(),
    payment: z.boolean(),
    createdAt : z.date(),
    updateAt : z.date(),
});

const PatchUserSchema = UserSchema.partial({nom:true,email:true,password:true}).omit({id:true});
const CreateUserSchema = UserSchema.omit({id:true});
const PutUserSChema = UserSchema;

const CreateOrdersSchema = OrderSchema.omit({total:true,payment:true,createdAt:true,updateAt:true});

const CreateProductSchema = ProductSchema.omit({ id : true});

// User
app.post("/users", async function (req, res) {
    const result = CreateUserSchema.safeParse(req.body);
    // If Zod parsed successfully the request body
    if (result.success) {
        const { nom, email, password } = result.data;
        const user = await sql`
        INSERT INTO users (nom,email, password)
        VALUES (${nom}, ${email}, ${hash_password(password)})
        RETURNING *
        `;
        res.send(user[0]);
    } else {
        res.status(400).send(result);
    }
});
app.patch("/users/:id", async function (req, res) {
    let id = req.params.id;
    const result = PatchUserSchema.safeParse(req.body);
    // If Zod parsed successfully the request body
    if (result.success) {
        const { nom, email, password } = result.data;
        const user = await sql`
        SELECT * FROM users WHERE id=${id}
        `;
        if (user.length > 0) {
            if(nom != undefined){
                await sql`
                UPDATE users
                SET nom = ${nom}
                WHERE id = ${id}`
            }
            if(password != undefined){
                await sql`
                UPDATE users
                SET password = ${hash_password(password)}
                WHERE id = ${id}`
            }
            if(email != undefined){
                await sql`
                UPDATE users
                SET email = ${email}
                WHERE id = ${id}`
            }
            const user = await sql`
            SELECT * FROM users WHERE id=${id}
            `;
            res.send(user[0]);
        } else {
            res.status(404).send({ message: "Not found" });
        }
    } else {
        res.status(400).send(result);
    }
});
app.put("/users",async function(req,res){
    const result = PutUserSChema.safeParse(req.body);
    if (result.success) {
        const { id,nom, email, password } = result.data;
        const user = await sql`
        SELECT * FROM users WHERE id=${id}
        `;
        if (user.length > 0) {
            //Update value from user if is defined
            let userPut = user[0];
            userPut.nom = nom ? nom : userPut.nom;
            userPut.email = email ? email : userPut.email;
            userPut.password = password ? hash_password(password) : userPut.password;
            await sql`
            UPDATE users
            SET nom = ${userPut.nom},email = ${userPut.email},password = ${userPut.password} 
            WHERE id = ${id}`
            res.send(userPut)
        } 
        else {
            //Create new user if not exist
            res.status(404).send({"message":"Not found"});
        }
    } else {
        res.status(400).send(result);
    }
})

// Product
app.post("/products", async function (req, res) {
    console.log(req.body)
    const result = CreateProductSchema.safeParse(req.body);
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
    let result = products;
    
    if(req.query.title){
        result = result.filter(product => product.title.includes(req.query.title))
    }
    if(req.query.about){
        result = result.filter(product => product.about.includes(req.query.about))
    }
    if(req.query.price){
        result = result.filter(product => product.price <= req.query.price)
    }
    res.send(result);
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


// Orders
app.post("/orders", async function (req, res) {
    const result = CreateOrdersSchema.safeParse(req.body);
    // If Zod parsed successfully the request body
    if (result.success) {
        const { userId, productId } = result.data;

        const user = await sql`SELECT * FROM users WHERE id=${userId};`
        const prod = await sql`SELECT * FROM products WHERE id=${productId};`

        if(user.length == 1 && prod.length == 1){
            let total = prod[0].price * 1.2;

            const orders = await sql`
            INSERT INTO orders (userId, productId, total, payment, createdAt, updatedAt)
            VALUES (${userId}, ${productId}, ${total}, false, ${Date.now()}, NULL)
            RETURNING *
            `;
            res.send(product[0]);
        }
        else{
            res.status(400,'bad request');
        }
    } else {
        res.status(400).send(result);
    }
});

app.get("/orders", async function (req, res) {
    const orders = await sql`
    SELECT * FROM Orders o
    LEFT JOIN products p ON p.id = o.orderId
    `;
  let result = orders;
  res.send(result);
});

// f2p-games

app.get("/f2p-games", async (req, res) => {
    fetch('https://www.freetogame.com/api/games')
    .then((response) => response.text())
    .then((body) => {
        res.send(JSON.parse(body));
    }); 
});
app.get("/f2p-games/:id", async (req, res) => {
    console.log(req.params.id);
    fetch('https://www.freetogame.com/api/game?id='+req.params.id)
    .then((response) => response.text())
    .then((body) => {
        res.send(JSON.parse(body));
    }); 
});

// SERVER  
app.listen(port, () => {
    console.log(`Listening on http://localhost:${port}`);
  });
  
  