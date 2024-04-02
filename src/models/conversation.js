const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");
const Message = require("./message");

const Conversation = sequelize.define("conversation", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'conversation',
    timestamps: false
});

Conversation.hasMany(Message, { as: 'conversation', foreignKey: 'conversationId' });

module.exports = Conversation;
