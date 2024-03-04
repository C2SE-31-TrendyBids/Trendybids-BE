const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const User = require("./user");
const Product = require("./product");

const AuctionNotification = sequelize.define("auction_notification", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    title: DataTypes.STRING(50),
    content: DataTypes.TEXT,
    ownerProductId: {
        type: DataTypes.UUID,
        field: 'owner_product_id'
    },
    productId: {
        type: DataTypes.UUID,
        field: 'product_id',
    },
}, {
    tableName: 'auction_notification',
    timestamps: false
});

AuctionNotification.belongsTo(User, {foreignKey: 'ownerProductId', targetKey: 'id'})
AuctionNotification.belongsTo(Product, {foreignKey: 'productId', targetKey: 'id'})

module.exports = AuctionNotification;
