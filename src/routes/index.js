const auth = require("./auth");
const initRoutes = (app) => {
  // Example
  app.use("/api/auth", auth);
  app.use((req, res) => {
    res.status(200).json({
      message: "Hello world!",
    });
  });
}

module.exports = initRoutes;
