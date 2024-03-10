const auth = require("./auth");
const user = require("./user");
const censor = require("./censor")
const initRoutes = (app) => {
  // Example
  app.use("/api/auth", auth);
  app.use("/api/user", user);
  app.use("/api/censor", censor);

  app.use((req, res) => {
    res.status(200).json({
      message: "Hello world!",
    });
  });
}

module.exports = initRoutes;
