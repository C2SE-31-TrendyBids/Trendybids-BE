const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const User = require("./user");
const Product = require("./product");

const AuctionNotifications = sequelize.define("auction_notifications", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    title: DataTypes.STRING(50),
    content: DataTypes.TEXT,
    owner_product_id: DataTypes.UUID,
    product_id: DataTypes.UUID,
});

AuctionNotifications.belongsTo(User, {foreignKey: 'owner_product_id', targetKey: 'id'})
AuctionNotifications.belongsTo(Product, {foreignKey: 'product_id', targetKey: 'id'})

module.exports = AuctionNotifications;
