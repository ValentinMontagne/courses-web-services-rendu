const postgres = require("postgres");
const soap = require("soap");
const fs = require("node:fs");
const http = require("http");
	
const sql = postgres({ db: "mydb", user: "user", password: "password", port: "5435", host: "localhost" });



const service = {
  ProductsService: {
    ProductsPort: {
      CreateProduct: async function ({ name, about, price }, callback) {
        // Check if any of the required fields are missing
        if (!name || !about || !price) {
          throw {
            Fault: {
              Code: {
                Value: "soap:Sender",
                Subcode: { value: "rpc:BadArguments" },
              },
              Reason: { Text: "Processing Error" },
              statusCode: 400, // Utilisez le code d'état HTTP 400 pour les erreurs de requête client
            },
          };
    
        }

        try {
          // Insert the new product into the database
          const product = await sql`
            INSERT INTO products (name, about, price)
            VALUES (${name}, ${about}, ${price})
            RETURNING *
          `;

          // Log the inserted product
          console.log("Inserted product:", product);

          // Callback with the inserted product
          callback({ ...product, });
        } catch (error) {
          // Handle any errors that occur during database insertion
          console.error("Error inserting product:", error);

          // Throw a SOAP Fault in case of database error
          throw {
            Fault: {
              Code: {
                Value: "soap:Receiver",
                Subcode: { value: "rpc:DatabaseError" },
              },
              Reason: { Text: "Database Error" },
              Detail: { Text: "Error inserting product into the database" },
            },
          };
        }
      },
      GetProduct: async function (_, callback) {
        const product = await sql `
      SELECT * FROM PRODUCTS`;

      callback(product);
    }
      
      
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