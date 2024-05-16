const express = require("express");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const f2pgameRoutes = require("./routes/f2pgameRoutes");


const app = express();
const port = 8000;

app.use(express.json());

app.use("/products", productRoutes);
app.use("/users", userRoutes);
app.use("/f2pgames", f2pgameRoutes);

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

