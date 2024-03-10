const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/productController");

router.get("/get-all", productControllers.getProductByQuery);


module.exports = router;