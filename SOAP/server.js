const soap = require("soap");
const fs = require("node:fs");
const http = require("http");
const postgres = require("postgres");
const sql = postgres({ db: "mydb", user: "postgres", password: "toor" });

// Définir l'implémentation du service
const service = {
  ProductsService: {
    ProductsPort: {
      // Logique pour CreateProduct
      CreateProduct: async function ({ name, about, price }, callback) {
        if (!name || !about || !price) {
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "rpc:BadArguments" },
              },
              Reason: { Text: "Processing Error" },
              statusCode: 400,
            },
          };
        }

        const product = await sql`
          INSERT INTO products (name, about, price)
          VALUES (${name}, ${about}, ${price})
          RETURNING *
          `;

        // Will return only one element.
        callback(product[0]);
      },

      GetProducts: async function (_, callback) {
        const products = await sql`SELECT * FROM products`;
        callback(products);
      },
    }
  }
};

// Création du serveur HTTP
const server = http.createServer(function (request, response) {
  response.end("404: Not Found: " + request.url);
});

// Écouter le serveur sur le port 8000
const PORT = 8000; // Utilisez un port disponible, comme 8000
server.listen(PORT, () => {
  console.log(`Serveur HTTP en cours d'exécution sur le port ${PORT}`);
});

// Créer le serveur SOAP
const xml = fs.readFileSync("productsService.wsdl", "utf8");
soap.listen(server, "/products", service, xml, function () {
  console.log("Serveur SOAP en cours d'exécution à http://localhost:8000/products?wsdl");
});
