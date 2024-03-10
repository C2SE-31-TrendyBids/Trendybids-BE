const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const Product = require("./product");
const Censor = require("./censor");

const ProductAuction = sequelize.define("product_auction", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    description: DataTypes.TEXT,
    startTime: {
        type: DataTypes.DATE,
        field: 'start_time',
    },
    numberOfParticipation: {
        type: DataTypes.INTEGER,
        field: 'number_of_participation',
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
    timestamps: false
});

ProductAuction.belongsTo(Product, {foreignKey: 'productId', targetKey: 'id', as: 'product'});
 ProductAuction.belongsTo(Censor, {foreignKey: 'censorId', targetKey: 'id', as: 'censor'});

module.exports = ProductAuction;
