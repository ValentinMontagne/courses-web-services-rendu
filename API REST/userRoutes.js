const express = require("express");
const router = express.Router();
const postgres = require("postgres");
const z = require("zod");
const crypto = require("crypto");
const sql = postgres({ db: "mydb", user: "user", password: "password" });

const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
});

const CreateUserSchema = userSchema.omit({ id: true });

router.route("/").post(async (req, res) => {
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

module.exports = router;
