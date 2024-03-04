const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const Censor = require("./censor");
const Product = require("./product");

const ProductAuction = sequelize.define("product_auction", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    description: DataTypes.TEXT,
    start_time: DataTypes.DATE,
    number_of_participation: DataTypes.INTEGER,
    product_id: DataTypes.UUID,
    censor_id: DataTypes.UUID,
});

ProductAuction.belongsTo(Product, {foreignKey: 'category_id', targetKey: 'id', as: 'category'})
ProductAuction.belongsTo(Censor, {foreignKey: 'censor_id', targetKey: 'id', as: 'censor'})

module.exports = ProductAuction;
