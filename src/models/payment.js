const sequelize = require("../config/database");
const {DataTypes} = require("sequelize");

const Payment = sequelize.define("payment", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    amount: DataTypes.DECIMAL(10, 2),
    paymentTime: {
        type: DataTypes.DATE,
        field: 'payment_time',
    },
    userId: {
        type: DataTypes.UUID,
        field: 'user_id',
    },
}, {
    tableName: 'payment',
    timestamps: false
});


module.exports = Payment;
