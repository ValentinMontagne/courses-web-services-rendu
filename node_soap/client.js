const soap = require("soap");

soap.createClient("http://localhost:8000/products?wsdl", {}, function (err, client) {
  if (err) {
    console.error("Error creating SOAP client:", err);
    return;
  }
  // Make a SOAP request
  client.CreateProduct({ name: "My product", about:"toto", price: 10 }, function (err, result) {
    if (err) {
      console.error(
        "Error making SOAP request:",
        err.response.status,
        err.response.statusText,
        err.body
      );
      return;
    }
    console.log("Result:", result.id);
  });

  // client.DeleteProduct(2, function(result) {
  //   console.log(result)
  // })
  
  // client.PatchProduct({id: 2 , name: "tata"}, function(err, result) {
  //   if (err) {
  //     console.log("error : ", err);
  //     return;
  //   }
  //   console.log(result)
  // })

  client.GetProducts(function(err, result) {
    if (err) {
        console.log("error : ", err);
        return;
    }
    console.log(result);
  })


});
