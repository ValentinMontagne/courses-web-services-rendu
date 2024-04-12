const soap = require("soap");
const fs = require("node:fs");
const http = require("http");
const postgres = require("postgres");

const sql = postgres({db: "mydb", user: "user", password: "password"});

const service = {
    ProductsService: {
        ProductsPort: {
            CreateProduct: async function ({name, about, price}, callback) {
                if (!name || !about || !price) {
                    throw {
                        Fault: {
                            Code: {
                                Value: "soap:Sender",
                                Subcode: {value: "rpc:BadArguments"},
                            },
                            Reason: {Text: "Processing Error"},
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
            GetProducts: async function ({name}, callback) {
                if (!name) {
                    throw {
                        Fault: {
                            Code: {
                                Value: "soap:Sender",
                                Subcode: {value: "rpc:BadArguments"},
                            },
                            Reason: {Text: "Processing Error"},
                            statusCode: 400,
                        },
                    };
                }

                const product = await sql`
          SELECT * FROM products
          WHERE products.name = name
          `;

                callback(product[0]);
            },
        },
    },
};

const server = http.createServer(function (request, response) {
    response.end("404: Not Found: " + request.url);
});

server.listen(8000);

const xml = fs.readFileSync("productsService.wsdl", "utf8");
soap.listen(server, "/products", service, xml, function () {
    console.log("Soap running at http://localhost:8000/products?wsdl");
})