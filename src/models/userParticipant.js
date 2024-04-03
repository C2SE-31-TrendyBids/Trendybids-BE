const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");

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



module.exports = UserParticipant;
