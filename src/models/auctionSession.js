const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");

const AuctionSession = sequelize.define("auction_session", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    start_time: DataTypes.DATE,
    end_time: DataTypes.DATE,
    highest_price: DataTypes.DECIMAL(10, 2),
    highest_bidder: DataTypes.UUID,
    status: DataTypes.ENUM('ongoing', 'ended', 'cancelled', 'not_started'),
    total_number_auction: DataTypes.INTEGER,
    product_auction_id: DataTypes.UUID,
});

module.exports = AuctionSession;
