const express = require("express");
const router = express.Router();
const z = require("zod");
const { ObjectId } = require("mongodb");

module.exports = function (db) {
  // Schemas
  const CategorySchema = z.object({
    _id: z.string(),
    name: z.string(),
  });
  const CreateCategorySchema = CategorySchema.omit({ _id: true });

  router.post("/", async (req, res) => {
    const result = await CreateCategorySchema.safeParse(req.body);
   
    // If Zod parsed successfully the request body
    if (result.success) {
      const { name } = result.data;
   
      const ack = await db.collection("categories").insertOne({ name });
   
      res.send({ _id: ack.insertedId, name });
    } else {
      res.status(400).send(result);
    }
  });

  return router;
};
