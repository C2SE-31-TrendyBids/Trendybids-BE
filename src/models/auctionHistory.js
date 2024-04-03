const sequelize = require("../util/database");
const { DataTypes } = require("sequelize");
const User = require("./user");


const AuctionHistory = sequelize.define("auction_history", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    auctionPrice: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'auction_price',
    },
    productAuctionId: {
        type: DataTypes.UUID,
        field: 'product_auction_id',
    },
    userId: {
        type: DataTypes.UUID,
        field: 'user_id',
    },
}, {
    tableName: 'auction_history',
    timestamps: true
});

AuctionHistory.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user' })

module.exports = AuctionHistory;
