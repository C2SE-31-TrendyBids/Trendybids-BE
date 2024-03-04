const sequelize = require("../util/database");
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
    user_id: DataTypes.UUID,
    product_auction_id: DataTypes.UUID,
});

UserParticipant.belongsTo(User, {foreignKey: 'user_id', targetKey: 'id', as: 'user'})
UserParticipant.belongsTo(ProductAuction, {foreignKey: 'product_auction_id', targetKey: 'id', as: 'product'})

module.exports = UserParticipant;
