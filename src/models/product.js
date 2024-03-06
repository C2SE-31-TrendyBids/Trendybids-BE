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
    productName: {
        type: DataTypes.STRING(50),
        field: 'product_name',
    },
    description: DataTypes.TEXT,
    startingPrice: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'starting_price',
    },
    imageId: {
        type: DataTypes.UUID,
        field: 'image_id',
    },
    categoryId: {
        type: DataTypes.STRING(10),
        field: 'category_id',
    },
    ownerProductId: {
        type: DataTypes.UUID,
        field: 'owner_product_id',
    },
    censorId: {
        type: DataTypes.UUID,
        field: 'censor_id',
    },
}, {
    tableName: 'product',
    timestamps: false
});

Product.belongsTo(PrdImage, {foreignKey: 'imageId', targetKey: 'id', as: 'image'})
Product.belongsTo(Category, {foreignKey: 'categoryId', targetKey: 'id', as: 'category'})
Product.belongsTo(User, {foreignKey: 'ownerProductId', targetKey: 'id', as: 'owner'})
Product.belongsTo(Censor, {foreignKey: 'censorId', targetKey: 'id', as: 'censor'})

module.exports = Product;
