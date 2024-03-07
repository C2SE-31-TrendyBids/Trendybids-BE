const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const Product = require("./product");

const PrdImage = sequelize.define("prd_image", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    prd_imageURL: DataTypes.TEXT,
    product_id: DataTypes.UUID,
});

// PrdImage.belongsTo(Product, {foreignKey: 'product_id', targetKey: 'id', as: 'product'})

module.exports = PrdImage;
