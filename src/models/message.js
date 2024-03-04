const sequelize = require("../util/database");
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
    content: DataTypes.STRING(20),
    created_at: DataTypes.TEXT,
    conversation_id: DataTypes.UUID,
    user_id: DataTypes.UUID,
});

Message.belongsTo(Conversation, {foreignKey: 'conversation_id', targetKey: 'id', as: 'conversation'})
Message.belongsTo(User, {foreignKey: 'user_id', targetKey: 'id', as: 'user'})

module.exports = Message;
