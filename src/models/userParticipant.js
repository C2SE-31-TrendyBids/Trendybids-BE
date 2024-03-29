const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");
const User = require("./user");
const ProductAuction = require("./productAuction");


const UserParticipant = sequelize.define("user_participant", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.UUID,
        field: 'user_id',
    },
    productAuctionId: {
        type: DataTypes.UUID,
        field: 'product_auction_id',
    },
}, {
    tableName: 'user_participant',
    timestamps: false
});

UserParticipant.belongsTo(User, {foreignKey: 'userId', targetKey: 'id', as: 'user'})
UserParticipant.belongsTo(ProductAuction, {foreignKey: 'productAuctionId', targetKey: 'id', as: 'product'})

module.exports = UserParticipant;
