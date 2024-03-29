const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");
const User = require("./user");

const Conversation = sequelize.define("conversation", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    creatorId: {
        type: DataTypes.UUID,
        field: 'creator_id',
    },
    recipientId: {
        type: DataTypes.UUID,
        field: 'recipient_id',
    },
    lastMessageId: {
        type: DataTypes.UUID,
        field: 'last_message_id',
    },
}, {
    tableName: 'conversation',
    timestamps: false
});

// Conversation.belongsTo(User, {foreignKey: 'creatorId', targetKey: 'id', as: 'creator', constraints: false})
// Conversation.belongsTo(User, {foreignKey: 'recipientId', targetKey: 'id', as: 'recipient', constraints: false})

module.exports = Conversation;
