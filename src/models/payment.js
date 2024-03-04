const sequelize = require("../util/database");
const {DataTypes} = require("sequelize");
const User = require("./user");

const Payment = sequelize.define("payment", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    amount: DataTypes.DECIMAL(10, 2),
    payment_time: DataTypes.DATE,
    user_id: DataTypes.UUID,
});

Payment.belongsTo(User, {foreignKey: 'user_id', targetKey: 'id', as: 'user'})

module.exports = Payment;
