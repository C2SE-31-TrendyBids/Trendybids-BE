const {DataTypes} = require("sequelize");
const sequelize = require("../util/database");
const Role = require('./role')
const Wallet = require('./wallet')
const Feedback = require('./feedback')

const User = sequelize.define("user", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    full_name: DataTypes.STRING(50),
    email: DataTypes.STRING,
    phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    avatar_url: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    wallet_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    role_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
});

User.belongsTo(Wallet, {foreignKey: 'wallet_id', targetKey: 'id', as: 'wallet'})
User.belongsTo(Role, {foreignKey: 'role_id', targetKey: 'id', as: 'role'})

module.exports = User;
