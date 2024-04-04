const auth = require("./auth");
const user = require("./user");
const product = require("./product");
const admin = require('./admin')
const censor = require('./censor')
const category = require('./category')
const conversation = require('./conversation')
const message = require('./message')

const initRoutes = (app) => {
  // Example
  app.use("/api/auth", auth);
  app.use("/api/product", product);
  app.use("/api/censor", censor);
  app.use("/api/user", user);
  app.use("/api/admin", admin);
  app.use("/api/category", category);
  app.use("/api/conversation", conversation);
  app.use("/api/message", message);

  app.use((req, res) => {
    res.status(200).json({
      err: 1,
      message: "This route is not defined",
    });
  });
}

module.exports = initRoutes;
