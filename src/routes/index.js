const auth = require("./auth");
const user = require("./user");
const productAuction = require("./productAuction");
const product = require("./product");
const censor = require("./censor");
const initRoutes = (app) => {
  // Example
  app.use("/api/auth", auth);
  app.use("/api/product-auctions", productAuction);
  app.use("/api/products", product);
  app.use("/api/censors", censor);
  app.use("/api/user", user);
  app.use((req, res) => {
    res.status(200).json({
      message: "Hello world!",
    });
  });
}

module.exports = initRoutes;
