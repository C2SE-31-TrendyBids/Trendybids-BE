const ProductAuction = require('../models/productAuction')
const Product = require('../models/product')
const Censor = require('../models/censor')
const User = require('../models/user')
const PrdImage = require('../models/prdImage')
const Category = require('../models/category')
const {Op} = require("sequelize");

class ProductAuctionServices {

    async getAll({page, limit, order, name, ...query}, res) {
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


            if (order) queries.order = [order];
            if (name) query.description = {[Op.substring]: name};
            const {count, rows} = await ProductAuction.findAndCountAll({
                where: query,
                ...queries,
                attributes: {exclude: ['productId', 'censorId']},
                include: [
                    {
                        model: Product,
                        as: 'product',
                        required: true,
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
                        include: [
                            {
                                model: User,
                                as: 'user',
                                required: true,
                                attributes: {exclude: ['password', 'createdAt', 'updatedAt', 'walletId', 'roleId', 'refreshToken', 'status']}
                            }
                        ]
                    }
                ]
            });

            const totalPages = Math.ceil(count / limitNumber)
            return res.status(200).json({
                message: "Get product auction successfully!",
                totalItem: count,
                totalPages: totalPages,
                productAuctions: rows
            });
        } catch (err) {
            console.log(err);
            throw new Error(err)
        }


    }
}


module.exports = new ProductAuctionServices()
