const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Api Rest",
            version: "1.0.0",
            description: "Documentation de l'api Product",
        },
        servers: [
            {
                url: "http://localhost:8000", // Mettez l'URL de votre API ici
                description: "Serveur local",
            },
        ],
    },
    apis: ["./server.js"], // Mettez le chemin vers vos fichiers de définitions OpenAPI ici
};

module.exports = swaggerOptions;
