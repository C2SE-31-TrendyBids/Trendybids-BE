const express = require("express");
const router = express.Router();
const CategoryController = require('../controllers/categoryController')

router.get("/get-all-category", CategoryController.getDataCategory);


module.exports = router;