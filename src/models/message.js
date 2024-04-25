const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");

const Message = sequelize.define("message", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    content: DataTypes.TEXT,
    filesAttach: {
        type: DataTypes.JSON(),
        field: 'files_attach',
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: DataTypes.NOW,
    },
    isSeen: {
        type: DataTypes.BOOLEAN,
        field: 'is_seen',
        defaultValue: false,
    },
    seenAt: {
        type: DataTypes.DATE,
        field: 'seen_at',
        allowNull: true
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

module.exports = Message;
