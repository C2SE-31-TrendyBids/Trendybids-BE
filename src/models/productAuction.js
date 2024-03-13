const sequelize = require("../util/database");
const { DataTypes } = require("sequelize");
const Product = require("./product");
const Censor = require("./censor");

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

ProductAuction.belongsTo(Censor, { foreignKey: 'censorId', targetKey: 'id', as: 'censor' });
ProductAuction.belongsTo(Product, { foreignKey: 'productId', targetKey: 'id', as: 'product' });
// ProductAuction.belongsTo(Censor, { foreignKey: 'censorId', targetKey: 'id', as: 'censor' });

module.exports = ProductAuction;
