const CategoryService = require('../services/categoryService');

class CategoryController {
    async getDataCategory(req, res) {
        try {
            const data = await CategoryService.getAll();
            return res.status(200).json(data);
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Internal Server Error",
            });
        }
    }
}

module.exports = new CategoryController();