const {Op} = require("sequelize");
const Censor = require("../models/censor");
const ProductAuction = require("../models/productAuction");


class CensorService {
    async getCensors({page, limit, order, censorName, ...query}, res) {
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

            const censorQuery = {
                ...(censorName ? {productName: {[Op.substring]: censorName}} : {}),
                ...query
            };

            const response = await Censor.findAll({
                    where: censorQuery,
                    ...queries,
                    attributes: {exclude: ['walletId', 'roleId', 'createdAt', 'updatedAt', 'userId']},
                    include: [
                        {
                            model:ProductAuction,
                            as: "productAuctions",
                            attributes: {exclude: ['productId', 'censorId']},
                        }
                    ]
                },
            );

            const totalPages = Math.ceil(response.length / limitNumber)
            return res.status(200).json({
                message: "Get products successfully!",
                totalItem: response.length,
                totalPages: totalPages,
                censors: response
            });
        } catch (err) {
            console.log(err);
            throw new Error(err)
        }


    }

}

module.exports = new CensorService()