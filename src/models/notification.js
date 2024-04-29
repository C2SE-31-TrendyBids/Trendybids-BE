const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");

const Notification = sequelize.define("notification", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM('public', 'private'),
        defaultValue: 'public'
    },
    title: DataTypes.STRING(50),
    content: DataTypes.TEXT,
    linkAttach: {
        type: DataTypes.STRING(255),
        field: 'link_attach',
        allowNull: true
    },
    recipientId: {
        type: DataTypes.UUID,
        field: 'recipient_id',
        allowNull: true
    },
    isSeen: {
        type: DataTypes.BOOLEAN,
        field: 'is_seen',
        defaultValue: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'notification',
    timestamps: false
});

module.exports = Notification;
