const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const User = require("./conversation");

const Wallet = sequelize.define("wallet", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    money: DataTypes.DECIMAL(10,2),
});

Wallet.hasOne(User)

module.exports = Wallet;
