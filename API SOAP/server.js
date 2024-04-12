const soap = require("soap");
const fs = require("node:fs");
const http = require("http");
const postgres = require("postgres");

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

        // Will return only one element.
        callback(product[0]);
        // callback({ ...args, id: "myid" });
      },
      GetProducts: async function(_,callback) {
        const products = await sql`
        SELECT * FROM products
        `;

        if (products.length == 0) {
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "rpc:BadArguments" },
              },
              Reason: { Text: "Processing Error" },
              statusCode: 500,
            },
          };
          
        }
        callback(products);

      },
      DeleteProduct: async function ({ id }, callback) {
        if(!id) {
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
      console.log(id);
        const product = await sql`
        DELETE FROM products WHERE id = ${id}`

        return callback(product);
      },
      PatchProduct: async function ({ id, name, about, price }, callback) {
        const product = await sql`
        UPDATE products
        SET name = ${name}, about = ${about}, price = ${price}
        WHERE products.id = ${id}
        RETURNING *
        `;

        // Will return only one element.
        callback(product[0]);
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
