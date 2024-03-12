const sequelize = require("../util/database");
const { DataTypes } = require("sequelize");
const Product = require("./product");


const PrdImage = sequelize.define("prd_image", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    prdImageURL: {
        type: DataTypes.TEXT,
        field: 'prd_imageURL'
    },
    productId: {
        type: DataTypes.UUID,
        field: 'product_id',
    },
}, {
    tableName: 'prd_image',
    timestamps: false
});

//PrdImage.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = PrdImage;
