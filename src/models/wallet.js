const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const Wallet = sequelize.define("wallet", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    money: DataTypes.DECIMAL(10, 2),
    userId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    tableName: 'wallet',
    timestamps: false,
});

module.exports = Wallet;
