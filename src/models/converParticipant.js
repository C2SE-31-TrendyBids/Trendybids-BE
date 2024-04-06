const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");

const converParticipant = sequelize.define("converParticipant", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },userId: {
        type: DataTypes.UUID,
        field: 'user_id',
    },
    conversationId: {
        type: DataTypes.UUID,
        field: 'conversation_id',
    },
}, {
    tableName: 'conver_participant',
    timestamps: false
})

module.exports = converParticipant;
