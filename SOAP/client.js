const soap = require("soap");

soap.createClient(
  "http://localhost:8000/products?wsdl",
  {},
  function (err, client) {
    if (err) {
      console.error("Error creating SOAP client:", err);
      return;
    }
    // Make a SOAP request

    client.GetProducts({}, function (err, products) {
      if (err) {
        console.error(
          "Error making SOAP request:",
          err.response.status,
          err.response.statusText,
          err.body
        );
        return;
      }
      console.log("Products:", products);
    });

    /*client.CreateProduct(
      { name: "My product", about: "test", price: "100" },
      function (err, result) {
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
      }
    );
    */
  }
);
