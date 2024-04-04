const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");

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

module.exports = AuctionNotification;
