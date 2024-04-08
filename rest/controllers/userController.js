const sql = require("postgres")({ db: "mydb", user: "user", password: "password" });
const z = require("zod");

// Schéma de validation pour les utilisateurs
const UserSchema = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string(),
});

const UpdateUserSchema = z.object({
    email: z.string().email().optional(),
    password: z.string().optional(),
});

// Schéma de validation pour la création d'un utilisateur
const CreateUserSchema = UserSchema.omit({ id: true });

/**
 * Crée un nouveau produit.
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 */
exports.createUser = async (req, res) => {
    try {
        // Validation du corps de la requête avec le schéma de création d'utilisateur
        const result = await CreateUserSchema.safeParse(req.body);

        // Si la validation réussit
        if (result.success) {
            // Extraire les données validées du corps de la requête
            const { username, email, password } = result.data;

            // Insertion des données dans la base de données
            const user = await sql`
            INSERT INTO users (username, email, password)
            VALUES (${username}, ${email}, ${password})
            RETURNING *`;

            // Retirer le mot de passe de la réponse
            delete user.password;

            // Envoyer une réponse avec le user créé
            res.status(201).json(user);

        } else {
            // Si la validation échoue, envoyer une réponse avec le code d'état 400 (Bad Request)
            // et le résultat de la validation qui contient les erreurs de validation
            res.status(400).json(result);
        }
    } catch (error) {
        // En cas d'erreur lors de la création de l'utilisateur, envoyer une réponse avec le code d'état 500 (Internal Server Error)
        // et un message d'erreur générique
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Met à jour un utilisateur existant.
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 */
exports.updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await UpdateUserSchema.safeParse(req.body);

        // Si la validation réussit
        if (result.success) {
            // Extraire les données validées du corps de la requête
            const { email, password } = result.data;

            // Mise à jour des données dans la base de données
            const user = await sql`
            UPDATE users
            SET email=${email}, password=${password}
            WHERE id=${userId}
            RETURNING *`;

            // Si l'utilisateur n'existe pas, renvoyer une erreur 404
            if (user.length === 0) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            // Retirer le mot de passe de la réponse
            delete user.password;
            res.json(user[0]);
        } else {
            // Si la validation échoue, envoyer une réponse avec le code d'état 400 (Bad Request)
            // et le résultat de la validation qui contient les erreurs de validation
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

/**
 * Met à jour partiellement un utilisateur existant.
 * @param {Object} req - Requête HTTP.
 * @param {Object} res - Réponse HTTP.
 */
exports.partialUpdateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await UpdateUserSchema.safeParse(req.body);

        // Si la validation réussit
        if (result.success) {
            // Extraire les données validées du corps de la requête
            const { email, password } = result.data;

            // Mise à jour des données dans la base de données
            const user = await sql`
            UPDATE users
            SET email=${email}, password=${password}
            WHERE id=${userId}
            RETURNING *`;

            // Si l'utilisateur n'existe pas, renvoyer une erreur 404
            if (user.length === 0) {
                res.status(404).json({ message: "User not found" });
                return;
            }

            // Retirer le mot de passe de la réponse
            delete user.password;
            res.json(user[0]);
        } else {
            // Si la validation échoue, envoyer une réponse avec le code d'état 400 (Bad Request)
            // et le résultat de la validation qui contient les erreurs de validation
            res.status(400).json(result);
        }
    } catch (error) {
        console.error("Error partially updating user:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Fonction pour hasher le mot de passe
const hashPassword = async (password) => {
    // Logique de hachage du mot de passe (par exemple, utiliser SHA-512)
};
