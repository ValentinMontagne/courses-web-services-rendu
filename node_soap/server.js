const soap = require("soap");
const fs = require("node:fs");
const http = require("http");
const postgres = require("postgres");
const { CallTracker } = require("node:assert");

const sql = postgres({ db: "mydb", user: "user", password: "password" });

// Define the service implementation
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
        callback(product[0]);
      },
      GetProducts: async function (_, callback) {
        const products = await sql`
        SELECT *
        FROM products
        `;
        if (!products) {
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "no products" },
              },
              Reason: { Text: "ProcessingError" },
              statusCode: 500,
            },
          };
        }
        callback(products);
      },
      DeleteProduct: async function (id, callback) {
        const isProduct = await sql`
        SELECT *
        FROM products
        WHERE id = ${id}
        `;
        if (!isProduct)
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "no products" },
              },
              Reason: { Text: "ProcessingError" },
              statusCode: 500,
            },
          };

        const deletedProduct = await sql`
        DELETE
        FROM products
        WHERE id = ${id}
        `;
        callback(deletedProduct);
      },
      PatchProduct: async function ( {id, name} , callback) {
        const productToPatch = await sql`
        PATCH product
        SET name = ${name}
        WHERE id = ${ id }
        `;
        if (!productToPatch) {
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "no products" },
              },
              Reason: { Text: "ProcessingError" },
              statusCode: 500,
            },
          };

        }
        callback(productToPatch)
      },
    },
  },
};
// http server example
const server = http.createServer(function (request, response) {
  response.end("404: Not Found: " + request.url);
});

server.listen(8000);

// Create the SOAP server
const xml = fs.readFileSync("productsService.wsdl", "utf8");
soap.listen(server, "/products", service, xml, function () {
  console.log("SOAP server running at http://localhost:8000/products?wsdl");
});
