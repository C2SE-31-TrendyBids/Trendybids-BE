const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");
const Conversation = require("./conversation");
const User = require("./user");

const Message = sequelize.define("message", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    content: DataTypes.TEXT,
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
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

Message.belongsTo(Conversation, {foreignKey: 'conversationId', targetKey: 'id', as: 'conversation'})
Message.belongsTo(User, {foreignKey: 'userId', targetKey: 'id', as: 'user'})

module.exports = Message;
