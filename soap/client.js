const soap = require("soap");

const productData = {
    name: "Nouveau produit",
    about: "Description du nouveau produit",
    price: 19.99,
};

soap.createClient("http://localhost:8000/products?wsdl", {}, function (err, client) {
  if (err) {
    console.error("Error creating SOAP client:", err);
    return;
  }
  // Make a SOAP request
  client.CreateProduct(productData, function (err, result) {
    if (err) {
      console.error(
        "Error making SOAP request:",
        err.response.status,
        err.response.statusText,
        err.body
      );
      return;
    }
    console.log("Result:", result);
  });
});
