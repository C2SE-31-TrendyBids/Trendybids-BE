const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");
const Product = require("./product");

const ProductAuction = sequelize.define("product_auction", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    title: DataTypes.TEXT,
    description: DataTypes.TEXT,
    startTime: {
        type: DataTypes.DATE,
        field: 'start_time',
    },
    endTime: {
        type: DataTypes.DATE,
        field: 'end_time',
    },
    numberOfParticipation: {
        type: DataTypes.INTEGER,
        field: 'number_of_participation',
        defaultValue: 0
    },
    highestPrice: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'highest_price',
        defaultValue: 0
    },
    highestBidder: {
        type: DataTypes.UUID,
        field: 'highest_bidder',
    },
    status: {
        type: DataTypes.ENUM('ongoing', 'ended', 'cancelled', 'not_started'),
        defaultValue: 'not_started'
    },
    totalNumberAuction: {
        type: DataTypes.INTEGER,
        field: 'total_number_auction',
        defaultValue: 0
    },
    productId: {
        type: DataTypes.UUID,
        field: 'product_id',
    },
    censorId: {
        type: DataTypes.UUID,
        field: 'censor_id',
    },
}, {
    tableName: 'product_auction',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: false
});

module.exports = ProductAuction;
