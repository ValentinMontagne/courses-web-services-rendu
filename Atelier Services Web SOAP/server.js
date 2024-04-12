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
        },
    //   },

      // GetProduct: async function ({ id }, callback) {
      //   if (!id) {
      //     throw {
      //       Fault: {
      //         Code: {
      //           Value: "soap:Sender",
      //           Subcode: { value: "rpc:BadArguments" },
      //         },
      //         Reason: { Text: "Processing Error" },
      //         statusCode: 400,
      //       },
      //     };
      //   }

      //   const product = await sql`
      //         SELECT * FROM products WHERE id = ${id}
      //     `;
      //   // Will return only one element.
      //   callback(product[0]);
      // },

      GetProducts: async function (_, callback) {
        const products = await sql`SELECT * FROM products`;

        if (!products) {
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
        callback(products);
      },

      PatchProducts: async function ({ id, name, about, price }, callback) {
        if (!id || !name || !about || !price) {
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
                    UPDATE products
                    SET name = ${name}, about = ${about}, price = ${price}
                    WHERE id = ${id}
                    RETURNING *
                `;
        callback(product[0]);
      },

     DeleteProducts: async function ({ id }, callback) {
         if (!id) {
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
                  DELETE FROM products
                  WHERE id = ${id}
                  RETURNING *
                 `;
         callback(product);
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
