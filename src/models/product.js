const sequelize = require("../util/database");
const { DataTypes } = require("sequelize");
const User = require("./user");
const PrdImage = require("./prdImage");
const Censor = require("./censor");
const Category = require("./category");
const ProductAuction = require("./productAuction");

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
    status: {
        type: DataTypes.ENUM('Processing', 'Verified', 'Rejected', 'Success'),
        defaultValue: 'Processing',
    },
}, {
    tableName: 'product',
    timestamps: true
});

Product.hasMany(PrdImage, { foreignKey: 'productId', as: 'prdImages' })
Product.belongsTo(Category, { foreignKey: 'categoryId', targetKey: 'id', as: 'category' })
Product.belongsTo(User, { foreignKey: 'ownerProductId', targetKey: 'id', as: 'owner' })
Product.belongsTo(Censor, { foreignKey: 'censorId', targetKey: 'id', as: 'censor' })
ProductAuction.belongsTo(Product, { foreignKey: 'productId', targetKey: 'id', as: 'product' });

module.exports = Product;
