const soap = require("soap");
const url = "http://localhost:8000/products?wsdl";

soap.createClient(url, { returnFault: true }, function (err, client) {
  if (err) {
    console.error("Erreur lors de la création du client SOAP :", err);
    return;
  }
  // CreateProduct
  client.CreateProduct({ name: "My product", about: "ouii", price: 5 }, function (err, result) {
    if (err) {
      console.error(
        "Erreur lors de la requête SOAP :",
        err.response.status,
        err.response.statusText,
        err.body
      );
      return;
    }
    console.log("Résultat :", result);
  });
  // GetProduct
  client.GetProducts({}, function (err, result) {
    if (err) {
      console.error(
        "Erreur lors de la requête SOAP :",
        err.response.status,
        err.response.statusText,
        err.body
      );
      return;
    }
    console.log("Résultat :", result);
  });
});
