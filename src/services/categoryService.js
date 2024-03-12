const category = require("../models/category");

class CategoryService {
    async getAll() {
        try {
            const response = await category.findAll();
            return {
                message: "Get category successfully!",
                totalItem: response.length,
                categorys: response,
            };
        } catch (error) {
            console.log(error);
            throw new Error(error);
        }
    }
}

module.exports = new CategoryService();