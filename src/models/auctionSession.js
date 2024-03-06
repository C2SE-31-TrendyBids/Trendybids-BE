const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const ProductAuction = require("./productAuction");

const AuctionSession = sequelize.define("auction_session", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    startTime: {
        type: DataTypes.DATE,
        field: 'start_time',
    },
    endTime: {
        type: DataTypes.DATE,
        field: 'end_time',
    },
    highestPrice: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'highest_price',
    },
    highestBidder: {
        type: DataTypes.UUID,
        field: 'highest_bidder',
    },
    status: DataTypes.ENUM('ongoing', 'ended', 'cancelled', 'not_started'),
    totalNumberAuction: {
        type: DataTypes.INTEGER,
        field: 'total_number_auction',
    },
    productAuctionId: {
        type: DataTypes.UUID,
        field: 'product_auction_id',
    },
}, {
    tableName: 'auction_session',
    timestamps: false
});

AuctionSession.belongsTo(ProductAuction, {foreignKey: 'productAuctionId', targetKey: 'id', as: 'productAuction'})

module.exports = AuctionSession;
