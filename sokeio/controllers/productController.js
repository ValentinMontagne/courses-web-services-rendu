
const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017");
let db;


// Schéma de validation pour les produits
const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    about: z.string(),
    price: z.number().positive(),
});

const CreateProductSchema = ProductSchema.omit({ id: true });

