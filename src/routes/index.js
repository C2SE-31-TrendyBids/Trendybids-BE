const auth = require("./auth");
const user = require("./user");
const product = require("./product");
const admin = require('./admin')
const censor = require('./censor')
const category = require('./category')

const initRoutes = (app) => {
  // Example
  app.use("/api/auth", auth);
  app.use("/api/products", product);
  app.use("/api/censor", censor);
  app.use("/api/user", user);
  app.use("/api/admin", admin);
  app.use((req, res) => {
    res.status(200).json({
      message: "Hello world!",
    });
  });
}

module.exports = initRoutes;
