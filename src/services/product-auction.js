const ProductAuction = require('../models/productAuction')
const Product = require('../models/product')
const Censor = require('../models/censor')
const User = require('../models/user')
const {Op} = require("sequelize");

class ProductAuctionServices {

    async getAll({page, limit, order, name, ...query}) {
        try {
            const queries = {raw: true, nest: true};

            // Ensure page and limit are converted to numbers, default to 1 if not provided or invalid
            const pageNumber = isNaN(parseInt(page)) ? 1 : parseInt(page);
            const limitNumber = isNaN(parseInt(limit)) ? 4 : parseInt(limit);

            // Calculate the offset
            const offset = (pageNumber - 1) * limitNumber;

            queries.offset = offset;
            queries.limit = limitNumber;


            if (order) queries.order = [order];
            if (name) query.description = {[Op.substring]: name};
            const {count, rows} = await ProductAuction.findAndCountAll({
                where: query,
                ...queries,
                attributes: {exclude: ['product_id', 'censor_id']},
                // include: [
                //     {
                //         model: Product,
                //         as: 'product',
                //         required: true,
                //         attributes: {exclude: ['censor_id', 'createdAt', 'updatedAt', 'owner_product_id']},
                //         include: [
                //             {
                //                 model: User,
                //                 as: 'owner',
                //                 required: true,
                //                 attributes: {exclude: ['password', 'createdAt', 'updatedAt','wallet_id', 'role_id']}
                //             }
                //         ]
                //     },
                //     {
                //         model: Censor,
                //         as: 'censor',
                //         required: true,
                //         attributes: {exclude: ['wallet_id', 'role_id', 'createdAt', 'updatedAt','user_id']},
                //         include: [
                //             {
                //                 model: User,
                //                 as: 'user',
                //                 required: true,
                //                 attributes: { exclude: ['password', 'createdAt', 'updatedAt','wallet_id', 'role_id'] }
                //             }
                //         ]
                //     }
                // ]
            });
            return {
                totalItem: count,
                productAuctions: rows
            }
        } catch (err) {
            return {
                message: err.message
            }
        }


    }
}


module.exports = new ProductAuctionServices()
