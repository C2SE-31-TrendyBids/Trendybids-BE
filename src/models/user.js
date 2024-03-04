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
    fullName: {
        type: DataTypes.STRING(50),
        field: 'full_name',
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
        field: 'phone_number',
    },
    avatarUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'avatar_url',
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    walletId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'wallet_id',
    },
    roleId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'role_id',
    },
}, {
    tableName: 'user',
    timestamps: false
});

User.belongsTo(Wallet, {foreignKey: 'walletId', targetKey: 'id', as: 'wallet'})
User.belongsTo(Role, {foreignKey: 'roleId', targetKey: 'id', as: 'role'})

module.exports = User;
