const soap = require("soap");

// Création du client SOAP
soap.createClient("http://localhost:8000/products?wsdl", {}, function (err, client) {
  if (err) {
    console.error("Error creating SOAP client:", err);
    return;
  }

  // Envoyer une requête invalide (sans fournir la description)
  client.CreateProduct({ name: "Nom du produit", about:"Test" , price: 10.99 }, function (err, result) {
    if (err) {
      console.error("Error making SOAP request:", err.response.status, err.response.statusText, err.body);
      return;
    }
    console.log("Result:", result);
  });

  // Envoyer une requête valide
  client.GetProducts({}, function (err, result) {
    if (err) {
      console.error("Error making SOAP request:", err.response.status, err.response.statusText, err.body);
      return;
    }
    console.log("Result:", result);
  });

});
