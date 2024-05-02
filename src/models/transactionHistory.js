const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const TransactionHistory = sequelize.define("transaction_history", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    money: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'number_Money',
    },
    transactionType: DataTypes.ENUM('Posting_fee', 'Auction_fee', 'Product_fee', 'Top_up', 'Admin_payment', 'Mortgage_assets'),
    paymentMethods: DataTypes.ENUM('PayPal', 'E_Wallet', 'Bank'),
    userId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    receiverId: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    tableName: 'transaction_history',
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: false
    }
})

module.exports = TransactionHistory;
