const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const User = require("./user");
const PrdImage = require("./prdImage");
const Censor = require("./censor");
const Category = require("./category");

const Product = sequelize.define("product", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    product_name: DataTypes.STRING(50),
    description: DataTypes.TEXT,
    starting_price: DataTypes.DECIMAL(10,2),
    category_id: DataTypes.UUID,
    owner_product_id: DataTypes.UUID,
    censor_id: DataTypes.UUID,
});

Product.hasMany(PrdImage, {foreignKey: 'product_id', as: 'prdImages'})
Product.belongsTo(Category, {foreignKey: 'category_id', targetKey: 'id', as: 'category'})
Product.belongsTo(User, {foreignKey: 'owner_product_id', targetKey: 'id', as: 'owner'})
Product.belongsTo(Censor, {foreignKey: 'censor_id', targetKey: 'id', as: 'censor'})

module.exports = Product;
