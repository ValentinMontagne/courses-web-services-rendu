const soap = require("soap");

soap.createClient("http://localhost:8000/products?wsdl", {}, function (err, client) {
    if (err) {
        console.error("Error creating SOAP client:", err);
        return;
    }

    // ******************
    //      MAKE ONE
    //*******************

    // client.CreateProduct({ name: "test",about: "oui", price: 10,  }, function (err, result) {
    //     if (err) {
    //         console.error(
    //             "Error making SOAP request:",
    //             err.response.status,
    //             err.response.statusText,
    //             err.body
    //         );
    //         return;
    //     }
    //     console.log("Result:", result);
    // });

    // ******************
    //      DELETE ONE
    //*******************

    // client.DeleteProduct({id: 2},function (err, result) {
    //     if (err) {
    //         console.error(
    //             "Error making SOAP request:",
    //             err.response.status,
    //             err.response.statusText,
    //             err.body
    //         );
    //         return;
    //     }
    //     console.log("Result:", result);
    // });

    // ******************
    //      PATCH PRICE
    //*******************

    client.PatchPriceProduct({id:3, price: 400},function (err, result) {
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

    // ******************
    //      GET ALL
    //*******************

    // client.GetProduct({},function (err, result) {
    //     if (err) {
    //         console.error(
    //             "Error making SOAP request:",
    //             err.response.status,
    //             err.response.statusText,
    //             err.body
    //         );
    //         return;
    //     }
    //     console.log("Result:", result);
    // });


});
