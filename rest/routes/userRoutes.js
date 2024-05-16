const express = require("express");
const router = express.Router();
const postgres = require("postgres");
const z = require("zod");
const bcrypt = require("bcryptjs");

const sql = postgres({ db: "mydb", user: "user", password: "password" });

// Schemas
const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
});
const CreateUserSchema = UserSchema.omit({ id: true });

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await sql`
            SELECT username, email FROM users 
            WHERE id = ${id};
        `;

    if (user.length > 0) {
      res.send(user[0]);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
});


router.post("/", async (req, res) => {
    const result = CreateUserSchema.safeParse(req.body);

    if (result.success) {
        const { username, email, password } = result.data;

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await sql`
                INSERT INTO users (username, email, password)
                VALUES (${username}, ${email}, ${hashedPassword})
                RETURNING id, username, email, password;
            `;

            res.status(201).send(newUser[0]);
        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).send("Internal Server Error");
        }
    } else {
        res.status(400).send(result.error);
    }
});

module.exports = router;
