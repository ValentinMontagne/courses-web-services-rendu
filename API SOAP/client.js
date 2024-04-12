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
    //   { name: "ELi la machine", price: "10000000000000000", about: "I'm beautiful" },
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

    // client.GetProducts(function (err, result) {
    //   if (err) {
    //     console.error(
    //       "Error making SOAP request:",
    //       err.response.status,
    //       err.response.statusText,
    //       err.body
    //     );
    //     return;
    //   }
    //   console.log("Result:", result);
    // })
    // client.DeleteProduct({ id: 3 }, function (err, result) {
    //   if (err) {
    //     console.error(
    //       "Error making SOAP request:",
    //       err.response.status,
    //       err.response.statusText,
    //       err.body
    //     );
    //     return;
    //   }
    //   console.log("Result:", result);
    // });
    client.PatchProduct(
      { id: 4, name: "ELi la machine" },
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
  },
);
