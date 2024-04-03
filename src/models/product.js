const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

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

module.exports = Product;
