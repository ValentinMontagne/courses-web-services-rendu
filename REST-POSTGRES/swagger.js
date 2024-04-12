const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Votre API REST",
      version: "1.0.0",
      description: "Documentation de votre API REST avec Swagger",
    },
  },
  apis: ["./routes/*.js"], // Chemin vers les fichiers contenant les routes de votre API
};

const specs = swaggerJsdoc(options);

module.exports = specs;
