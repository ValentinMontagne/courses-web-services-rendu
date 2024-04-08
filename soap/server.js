const soap = require("soap");
const fs = require("node:fs");
const http = require("http");
const postgres = require("postgres");

const sql = postgres({db: "nodeJS", user: "postgres", password: "postgres"});


// Define the service implementation
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

                // Will return only one element.
                callback(product[0]);
            },
            GetProduct: async function ({id}, callback) {
                if (!id) {
                    throw {
                        Fault: {
                            Code: {
                                Value: "soap:Sender",
                                Subcode: {value: "rpc:BadArguments"},
                            },
                            Reason: {Text: "ID is required for GetProduct operation"},
                            statusCode: 400,
                        },
                    };
                }

                // Example query to retrieve a product by ID
                const productId = parseInt(id); // Assuming 'id' is a string, convert it to an integer
                const product = await sql`SELECT * FROM products WHERE id = ${productId}`;

                // Will return only one element.
                callback(product[0]);
            },
            DeleteProduct: async function ({id}, callback) {
                if (!id) {
                    throw {
                        Fault: {
                            Code: {
                                Value: "soap:Sender",
                                Subcode: {value: "rpc:BadArguments"},
                            },
                            Reason: {Text: "ID is required for GetProduct operation"},
                            statusCode: 400,
                        },
                    };
                }
                const productId = parseInt(id);
                const existingProduct = await sql`
        SELECT * FROM products
        WHERE id = ${id}
    `;

                if (!existingProduct[0]) {
                    // Product with the specified id not found
                    throw {
                        Fault: {
                            Code: {
                                Value: "soap:Sender",
                                Subcode: {value: "rpc:NotFound"},
                            },
                            Reason: {Text: `Product with ID ${id} not found`},
                            statusCode: 404,
                        },
                    };
                }
                const product = await sql`
                 DELETE FROM products
                 WHERE id = ${productId}
                 RETURNING *
                `
                callback(product[0]);
            },
            PatchProduct: async function ({id, name, about, price}, callback) {
                if (!id) {
                    throw {
                        Fault: {
                            Code: {
                                Value: "soap:Sender",
                                Subcode: {value: "rpc:BadArguments"},
                            },
                            Reason: {Text: "ID is required for PatchProduct operation"},
                            statusCode: 400,
                        },
                    };
                }
                const existingProduct = await sql`
        SELECT * FROM products
        WHERE id = ${id}
    `;

                if (!existingProduct[0]) {
                    // Product with the specified id not found
                    throw {
                        Fault: {
                            Code: {
                                Value: "soap:Sender",
                                Subcode: {value: "rpc:NotFound"},
                            },
                            Reason: {Text: `Product with ID ${id} not found`},
                            statusCode: 404,
                        },
                    };
                }

                const updateData = {
                    name: name,
                    about: about,
                    price: price,
                }
                const filteredUpdateData = Object.fromEntries(
                    Object.entries(updateData).filter(([_, value]) => value !== undefined)
                );
                const updateQuery = sql`
                UPDATE products
                SET ${sql(filteredUpdateData, ...Object.keys(filteredUpdateData))}
                WHERE id = ${id}
                RETURNING *
            `;
                try {
                    const updatedProduct = await updateQuery;
                    callback(updatedProduct[0]);
                } catch (error) {
                    console.error("Error executing SQL query:", error);
                    callback({error: "Erreur lors de la mise à jour dans la base de données"});
                }
            },
        },
    },
};


const server = http.createServer(function (request, response) {
    response.end("404: Not Found: " + request.url);
});

server.listen(8000);

// Create the SOAP server
const xml = fs.readFileSync("productsService.wsdl", "utf8");
soap.listen(server, "/products", service, xml, function () {
    console.log("SOAP server running at http://localhost:8000/products?wsdl");
});


