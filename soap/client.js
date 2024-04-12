const soap = require("soap");

// Créer le client SOAP
soap.createClient("http://localhost:8000/products?wsdl", {}, function (err, client) {
  if (err) {
    console.error("Error creating SOAP client:", err);
    return;
  }

  // Appeler l'opération CreateProduct
  client.CreateProduct({ name: "My product", about: "salut", price: "60" }, function (err, result) {
    if (err) {
      console.error(
        "Error making SOAP request:",
        err.response.status,
        err.response.statusText,
        err.body
      );
      return;
    }
    console.log("Result from CreateProduct:", result);

    // Appeler l'opération GetProduct avec l'identifiant du produit créé
    client.GetProducts({ id: result.id }, function (err, product) {
      if (err) {
        console.error(
          "Error making SOAP request:",
          err.response.status,
          err.response.statusText,
          err.body
        );
        return;
      }
      console.log("Result from GetProduct:", product);
    });
  });
});
