const soap = require("soap");
const fs = require("node:fs");
const http = require("http");
const postgres = require("postgres");

const sql = postgres({ db: "mydb", user: "user", password: "password" })

// Define the service implementation
const service = {
    ProductsService: {
        ProductsPort: {
            CreateProduct: async function ({ name, price, about }, callback) {
                if (!name || !about || !price) {
                    throw {
                        Fault: {
                            Code: {
                                Value: "soap:Sender",
                                Subcode: { value: "rpc:BadArguments" },
                            },
                            Reason: { Text: "Processing Error" },
                            statusCode: 400
                        },
                    };
                }
                try {

                    const product = await sql`
                    INSERT INTO products (name, about, price)
                    VALUES (${name}, ${about}, ${price})
                    RETURNING *
                    `;

                    callback(product[0]);
                } catch (error) {
                    console.log(error);
                }
            },
            GetProduct: async function (_, callback) {
                try {

                    const product = await sql`
                    SELECT * FROM products
                    `;

                    callback(product);
                } catch (error) {
                    console.log(error);
                }
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