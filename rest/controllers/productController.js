const sql = require("postgres")({ db: "mydb", user: "user", password: "password" });
const z = require("zod");

// Schéma de validation pour les produits
const ProductSchema = z.object({
    id: z.string(),
    name: z.string(),
    about: z.string(),
    price: z.number().positive(),
});

const CreateProductSchema = ProductSchema.omit({ id: true });

/**
 * Crée un nouveau produit.
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 * @returns {Object} - Retourne le produit créé.
 */
exports.createProduct = async (req, res) => {
    try {
        // Validation du corps de la requête avec le schéma de création de produit
        const result = await CreateProductSchema.safeParse(req.body);

        // Si la validation réussit
        if (result.success) {
            // Extraire les données validées du corps de la requête
            const { name, about, price } = result.data;

            // Insérer les données dans la base de données PostgreSQL
            const product = await sql`
                INSERT INTO products (name, about, price)
                VALUES (${name}, ${about}, ${price})
                RETURNING *`; // Retourner le nouveau produit créé

            // Envoyer une réponse avec le produit créé
            res.send(product[0]);
        } else {
            // Si la validation échoue, envoyer une réponse avec le code d'état 400 (Bad Request)
            // et le résultat de la validation qui contient les erreurs de validation
            res.status(400).send(result);
        }
    } catch (error) {
        // En cas d'erreur lors de la création du produit, envoyer une réponse avec le code d'état 500 (Internal Server Error)
        // et un message d'erreur générique
        console.error("Error creating product:", error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};



/**
 * Contrôleur pour obtenir tous les produits 
 * et prendre en charge ces paramètres de recherche
 * 
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 * @returns {Object} - Retourne le produit créé.
 */
exports.getAllProducts = async (req, res) => {

    // Récupérer les paramètres de la requête
    const { title, about, price } = req.query;

    console.log(title, about, price);

    const addTitleFilter = (title) => {
        console.log(title)
        return title ? sql` AND LOWER(name) LIKE LOWER('%${title}%')` : sql``;
    };

    const addAboutFilter = (about) => {
        return about ? sql` AND LOWER(about) LIKE LOWER('%${about}%')` : sql``;
    };

    const addPriceFilter = (price) => {
        return price ? sql` AND price <= ${parseFloat(price)}` : sql``;
    };



    const product = await sql` SELECT * FROM products WHERE 1=1 ${addTitleFilter(title)} ${addAboutFilter(about)} ${addPriceFilter(price)} `;


    console.log(product);

    // Envoyer une réponse avec les produits filtrés
    res.send(product);


    // try { } catch (error) {
    //     // En cas d'erreur, envoyer une réponse avec le code d'état 500 (Internal Server Error)
    //     // et un message d'erreur générique
    //     console.error("Error retrieving products:", error);
    //     res.status(500).send({ message: "Internal Server Error" });
    // }
};


/**
 * Récupère un produit par son ID.
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 * @returns {Object} - Retourne le produit correspondant à l'ID spécifié.
 */
exports.getProductById = async (req, res) => {
    // Récupérer le produit avec l'ID spécifié de la base de données PostgreSQL
    const product = await sql`
        SELECT * FROM products 
        WHERE id=${req.params.id}`;

    // Si le produit existe, l'envoyer en réponse, sinon envoyer une réponse avec le code d'état 404 (Not Found)
    if (product.length > 0) {
        res.send(product[0]);
    } else {
        res.status(404).send({ message: "Product not found" });
    }
};


/**
 * Supprime un produit par son ID.
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 * @returns {Object} - Retourne le produit supprimé.
 */
exports.deleteProductById = async (req, res) => {
    // Supprimer le produit avec l'ID spécifié de la base de données PostgreSQL
    const product = await sql`
        DELETE FROM products
        WHERE id=${req.params.id}
        RETURNING *`;

    // Si le produit a été supprimé, l'envoyer en réponse, sinon envoyer une réponse avec le code d'état 404 (Not Found)
    if (product.length > 0) {
        res.send(product[0]);
    } else {
        res.status(404).send({ message: "Product not found" });
    }
};
