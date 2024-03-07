const auth = require("./auth");
const productAuction = require("./product-auction");
const initRoutes = (app) => {
  // Example
  app.use("/api/auth", auth);
  app.use("/api/product-auctions", productAuction);
  app.use((req, res) => {
    res.status(200).json({
      message: "Hello world!",
    });
  });
}

module.exports = initRoutes;
