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
    // client.CreateProduct(
    //   { name: "My product", about: "This is a product", price: "10" },
    //   function (err, result) {
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
    //   }
    // );

    // Make a SOAP request
    client.GetProducts(function (err, result) {
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

    // // Make a SOAP request
    // client.PatchProducts(
    //   { id: 3, name: "My new product", about: "This is a new product", price: "33" },
    //   function (err, result) {
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
    //   }
    // );

    // Make a SOAP request
    // client.DeleteProducts({ id: 1 }, function (err, result) {
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
    //   }
    // );
  }
);
