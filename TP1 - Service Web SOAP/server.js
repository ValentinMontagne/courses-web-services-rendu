const soap = require("soap");
const fs = require("fs");
const http = require("http");
const postgres = require("postgres");

const sql = postgres({ db: "mydb", user: "user", password: "password" });

// Définir l'implémentation du service
const service = {
  ProductsService: {
    ProductsPort: {
      CreateProduct: async function ({ name, about, price }, callback) {
        if (!name || !about || !price) {
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "rpc:BadArguments" },
              },
              Reason: { Text: "Erreur de traitement" },
              statusCode: 400,
            },
          };
        }

        const product = await sql`
          INSERT INTO products (name, about, price)
          VALUES (${name}, ${about}, ${price})
          RETURNING *
        `;

        callback(product[0]);
      },
      GetProducts: async function (_, callback) {
        const products = await sql`select * from products`;
        callback(products);
      },
      // Implémentation de PatchProduct
      PatchProduct: async function ({ id, name, about, price }, callback) {
        const updatedProduct = await updateProduct(id, name, about, price);
        callback(/* update is done */);
      },
      // Implémentation de DeleteProduct
      DeleteProduct: async function ({ id }, callback) {
         const deletedProduct = await deleteProduct(id);
        callback(/* delete is done */);
      },
    },
  },
};

// Serveur HTTP
const server = http.createServer(function (request, response) {
  response.end("404: Not Found: " + request.url);
});

server.listen(8000);

// Créer le serveur SOAP
const xml = fs.readFileSync("productsService.wsdl", "utf8");
soap.listen(server, "/products", service, xml, function () {
  console.log("Serveur SOAP en cours d'exécution sur http://localhost:8000/products?wsdl");
});
