const ProductAuction = require('../models/productAuction')
const Product = require('../models/product')
const Censor = require('../models/censor')
const User = require('../models/user')
const PrdImage = require('../models/prdImage')
const Category = require('../models/category')
const {Op} = require("sequelize");

class ProductAuctionServices {

    async getAll({page, limit, order, description, categoryId, priceFrom, priceTo, ...query}, res) {
        try {
            const queries = {raw: false, nest: true};
            // Ensure page and limit are converted to numbers, default to 1 if not provided or invalid
            let pageNumber = isNaN(parseInt(page)) ? 1 : parseInt(page);
            const limitNumber = isNaN(parseInt(limit)) ? 4 : parseInt(limit);

            // If pageNumber is less than 1, set it to 1
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            // Calculate the offset
            const offset = (pageNumber - 1) * limitNumber;

            queries.offset = offset;
            queries.limit = limitNumber;

            // handle config query
            if (order) queries.order = [order];
            // Commented out description query as it's not used
            if (description) query.description = {[Op.substring]: description};

            // Commented out categoryId query as it's already handled in productQuery
            if (categoryId) {
                query['$product.category.id$'] = categoryId;
            }

            const productQuery = {
                ...(priceFrom !== undefined ? {startingPrice: {[Op.gte]: priceFrom}} : {}),
                ...(priceTo !== undefined ? {startingPrice: {[Op.lte]: priceTo}} : {})
            };

            const response = await ProductAuction.findAll({
                where: query,
                ...queries,
                attributes: {exclude: ['productId', 'censorId']},
                include: [
                    {
                        model: Product,
                        as: 'product',
                        required: true,
                        where: productQuery,
                        attributes: {exclude: ['censorId', 'createdAt', 'updatedAt', 'ownerProductId', "categoryId"]},
                        include: [
                            {
                                model: User,
                                as: 'owner',
                                required: true,
                                attributes: {exclude: ['password', 'createdAt', 'updatedAt', 'walletId', 'roleId', 'refreshToken']}
                            }, {
                                model: PrdImage,
                                as: 'prdImages',
                                attributes: {exclude: ['productId']}
                            },
                            {
                                model: Category,
                                as: 'category',
                                required: true,
                            }
                        ],
                    },
                    {
                        model: Censor,
                        as: 'censor',
                        required: true,
                        attributes: {exclude: ['walletId', 'roleId', 'createdAt', 'updatedAt', 'userId']},

                    }
                ]
            });

            const totalPages = Math.ceil(response.length / limitNumber)
            return res.status(200).json({
                message: "Get product auction successfully!",
                totalItem: response.length,
                totalPages: totalPages,
                productAuctions: response
            });
        } catch (err) {
            console.log(err);
            throw new Error(err)
        }


    }
}


module.exports = new ProductAuctionServices()
