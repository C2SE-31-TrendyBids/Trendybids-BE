const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const User = require("./user");

const Conversation = sequelize.define("conversation", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    creator_id: DataTypes.UUID,
    recipient_id: DataTypes.UUID,
    last_message_id: DataTypes.UUID,
});

// Conversation.belongsTo(User, {foreignKey: 'creator_id', targetKey: 'id', as: 'creator', constraints: false})
// Conversation.belongsTo(User, {foreignKey: 'recipient_id', targetKey: 'id', as: 'recipient', constraints: false})

module.exports = Conversation;
