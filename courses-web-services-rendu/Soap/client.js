const soap = require("soap");

soap.createClient("http://localhost:8000/products?wsdl", {}, function (err, client) {
  if (err) {
    console.error("Error creating SOAP client:", err);
    return;
  }
  // Make a SOAP request
//   client.CreateProduct({ name: "My product 2", about: "Desc for my product 2", price: 20 }, function (err, result) {
//     if (err) {
//       console.error(
//         "Error making SOAP request:",
//         err.response.status,
//         err.response.statusText,
//         err.body
//       );
//       return;
//     }
//     console.log("Result:", result);
//   });
//   client.GetProducts(function (err, result){
//     if (err) {
//         console.error(
//             "Error making SOAP request:",
//             err.response.status,
//             err.response.statusText,
//             err.body
//         );
//         return;
//     }
//     console.log("Liste des produits:", result);
//   });

client.PatchProduct({id: 2, name: "MonNewProduit", about: "Mise a jour du produit", price: 10 }, function (err, result) {
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
