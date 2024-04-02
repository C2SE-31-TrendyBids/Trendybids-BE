const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");
const User = require("./user");
const Conversation = require("./conversation");

const Message = sequelize.define("message", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    content: DataTypes.TEXT,
    imgUrls: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        field: 'img_urls',
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: DataTypes.NOW,
    },
    conversationId: {
        type: DataTypes.UUID,
        field: 'conversation_id',
    },
    userId: {
        type: DataTypes.UUID,
        field: 'user_id',
    },
}, {
    tableName: 'message',
    timestamps: false
});

Message.belongsTo(User, { foreignKey: 'userId', targetKey: 'id', as: 'user' })
Message.belongsTo(Conversation, { foreignKey: 'conversationId', targetKey: 'id', as: 'conversation' })

module.exports = Message;
